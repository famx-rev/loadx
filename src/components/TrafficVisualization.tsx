import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  MousePointerClick,
  Globe as Globe2,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  TrendingUp,
  Activity as ActivityIcon,
  Megaphone,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Minus,
  Move,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { AnalyticsData, EventRow } from '@/lib/data';
import { Skeleton } from '@/components/Skeleton';

/* ------------------------------------------------------------------ */

function Spinner({ label }: { label: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <div>
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-1 h-3 w-64" />
        </div>
      </div>
      <div className="relative mt-3 overflow-hidden rounded-xl border border-border-c bg-surface-2" style={{ height: 260 }}>
        <div className="flex h-full items-center justify-center gap-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
        <Zap className="h-5 w-5 text-brand-500 dark:text-brand-400" />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-text">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-text-muted">{sub}</p>
    </div>
  );
}

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function bezierPath(x1: number, y1: number, x2: number, y2: number, curvature = 0.5): string {
  const dx = Math.abs(x2 - x1) * curvature;
  return `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

function bezierPoint(
  x1: number, y1: number, cx1: number, cy1: number,
  cx2: number, cy2: number, x2: number, y2: number, t: number,
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * x1 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x2,
    y: mt * mt * mt * y1 + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * y2,
  };
}

interface FlowNodeData {
  id: string;
  label: string;
  sublabel: string;
  count: number;
  icon: typeof Eye;
  tone: 'brand' | 'accent' | 'neutral';
  x: number;
  y: number;
}

interface FlowEdge {
  from: string;
  to: string;
  count: number;
  tone: 'brand' | 'accent';
}

const VIEW_W = 1000;
const VIEW_H = 400;
const NODE_R = 30;

export function TrafficVisualization({
  analytics,
  events,
  loading,
  eventsLoading,
}: {
  analytics: AnalyticsData | null | undefined;
  events: EventRow[] | undefined;
  loading: boolean;
  eventsLoading?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, dragging: false });
  const [visible, setVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const o = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.1 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const stats = useMemo(() => {
    const imp = analytics?.totals.impressions ?? 0;
    const clk = analytics?.totals.clicks ?? 0;
    if (imp === 0 && clk === 0 && events && events.length > 0) {
      const impressions = events.filter((e) => e.event_data?.eventName === 'impression').length;
      const clicks = events.filter((e) => e.event_data?.eventName === 'click').length;
      const hovers = events.filter((e) => e.event_data?.hovered === true).length;
      return { impressions, clicks, hovers, total: events.length };
    }
    const hovers = analytics?.totals.hovers ?? (events ? events.filter((e) => e.event_data?.hovered === true).length : 0);
    return { impressions: imp, clicks: clk, hovers, total: imp + clk };
  }, [analytics, events]);

  const deviceBreakdown = useMemo(() => {
    if (!events || events.length === 0) {
      const ab = analytics?.deviceBreakdown ?? [];
      const total = ab.reduce((s, d) => s + d.count, 0) || 1;
      return ab.map((d) => ({ device: d.device, pct: d.pct, count: d.count, total }));
    }
    const map = new Map<string, number>();
    for (const e of events) {
      const dev = e.event_data?.device || 'unknown';
      map.set(dev, (map.get(dev) || 0) + 1);
    }
    const total = events.length;
    return Array.from(map.entries())
      .map(([device, count]) => ({ device, count, pct: (count / total) * 100, total }))
      .sort((a, b) => b.count - a.count);
  }, [analytics, events]);

  const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;

  const nodes: FlowNodeData[] = useMemo(() => [
    { id: 'your-ad', label: 'Your Ad', sublabel: 'On Loadbar', count: stats.total, icon: Megaphone, tone: 'brand', x: 120, y: 200 },
    { id: 'network', label: 'Loadbar Network', sublabel: 'Publisher sites', count: stats.impressions, icon: Globe2, tone: 'neutral', x: 400, y: 200 },
    { id: 'impression', label: 'Impressions', sublabel: 'Ad shown', count: stats.impressions, icon: Eye, tone: 'brand', x: 700, y: 110 },
    { id: 'hover', label: 'Hovers', sublabel: 'Attention', count: stats.hovers, icon: ActivityIcon, tone: 'brand', x: 700, y: 290 },
    { id: 'click', label: 'Clicks', sublabel: 'To your site', count: stats.clicks, icon: MousePointerClick, tone: 'accent', x: 880, y: 200 },
  ], [stats]);

  const edges: FlowEdge[] = useMemo(() => [
    { from: 'your-ad', to: 'network', count: stats.total, tone: 'brand' },
    { from: 'network', to: 'impression', count: stats.impressions, tone: 'brand' },
    { from: 'network', to: 'hover', count: stats.hovers, tone: 'brand' },
    { from: 'impression', to: 'click', count: stats.clicks, tone: 'accent' },
    { from: 'hover', to: 'click', count: stats.hovers, tone: 'accent' },
  ], [stats]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, FlowNodeData>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const brandColor = isDark ? '#3dd79e' : '#17bd84';
  const accentColor = isDark ? '#ff7c38' : '#fb5c12';
  const neutralColor = isDark ? '#8590a8' : '#67738d';
  const lineBase = isDark ? 'rgba(133,144,168,0.25)' : 'rgba(103,115,141,0.2)';
  const nodeBg = isDark ? '#1a1d26' : '#ffffff';
  const labelColor = isDark ? '#f3f4f6' : '#111827';
  const sublabelColor = isDark ? '#9ca3af' : '#6b7280';

  const toneColor = (tone: string) =>
    tone === 'brand' ? brandColor : tone === 'accent' ? accentColor : neutralColor;

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFullscreen();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeFullscreen, isFullscreen]);

  const changeZoom = (amount: number) => {
    setZoom((current) => Math.min(2.5, Math.max(0.6, Number((current + amount).toFixed(1)))));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (loading && eventsLoading) return <Spinner label="Loading flow visualization…" />;

  const hasData = stats.total > 0 || (events && events.length > 0);
  if (!hasData) {
    return (
      <EmptyState
        title="No traffic flow yet"
        sub="Once your ad is shown across the Loadbar network, the flow from impression to click will appear here."
      />
    );
  }

  const panel = (
    <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-[200] overflow-auto p-5 sm:p-8 bg-surface' : 'card p-4'}`}>
      <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-500 dark:text-brand-400" />
            <div>
              <h2 className="font-display text-sm font-semibold text-text">Ad Flow Visualization</h2>
              <p className="text-[11px] text-text-subtle">Your ad → Loadbar network → impressions → clicks</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isFullscreen && (
              <>
                <button type="button" onClick={() => changeZoom(-0.1)} className="btn-ghost !p-2" aria-label="Zoom out" title="Zoom out">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center text-xs tabular-nums text-text-muted">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => changeZoom(0.1)} className="btn-ghost !p-2" aria-label="Zoom in" title="Zoom in">
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" onClick={resetView} className="btn-ghost !px-2.5 !py-2 text-xs">Reset</button>
              </>
            )}
            <button
              type="button"
              onClick={() => (isFullscreen ? closeFullscreen() : setIsFullscreen(true))}
              className="btn-ghost !p-2"
              aria-label={isFullscreen ? 'Close fullscreen' : 'Open fullscreen'}
              title={isFullscreen ? 'Close fullscreen' : 'Open fullscreen'}
            >
              {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* SVG canvas */}
        <div
          className={`relative mt-3 overflow-hidden rounded-xl border border-border-c bg-surface-2 ${isFullscreen ? 'h-[calc(100vh-170px)] min-h-[420px] cursor-grab active:cursor-grabbing' : ''}`}
          style={{ height: isFullscreen ? undefined : 260 }}
          onPointerDown={(event) => {
            if (!isFullscreen) return;
            dragRef.current = { x: pan.x, y: pan.y, startX: event.clientX, startY: event.clientY, dragging: true };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!isFullscreen || !dragRef.current.dragging) return;
            setPan({
              x: dragRef.current.x + event.clientX - dragRef.current.startX,
              y: dragRef.current.y + event.clientY - dragRef.current.startY,
            });
          }}
          onPointerUp={() => { dragRef.current.dragging = false; }}
          onPointerCancel={() => { dragRef.current.dragging = false; }}
          onWheel={(event) => {
            if (!isFullscreen) return;
            event.preventDefault();
            changeZoom(event.deltaY < 0 ? 0.1 : -0.1);
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: isDark
                ? 'radial-gradient(circle, rgba(133,144,168,0.1) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(103,115,141,0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: dragRef.current.dragging ? 'none' : 'transform 160ms ease-out',
            }}
          >
            <defs>
              <linearGradient id="edgeBrand" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={brandColor} stopOpacity={0.7} />
                <stop offset="100%" stopColor={brandColor} stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="edgeAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.7} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0.3} />
              </linearGradient>
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="particleBrand">
                <stop offset="0%" stopColor={brandColor} stopOpacity={1} />
                <stop offset="100%" stopColor={brandColor} stopOpacity={0} />
              </radialGradient>
              <radialGradient id="particleAccent">
                <stop offset="0%" stopColor={accentColor} stopOpacity={1} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* ---- Edges ---- */}
            {edges.map((edge, i) => {
              const from = nodeMap.get(edge.from)!;
              const to = nodeMap.get(edge.to)!;
              const path = bezierPath(from.x, from.y, to.x, to.y, 0.45);
              const gradId = edge.tone === 'brand' ? 'edgeBrand' : 'edgeAccent';
              const strokeColor = toneColor(edge.tone);
              const maxC = Math.max(1, stats.total);
              const strokeWidth = Math.max(1.5, (edge.count / maxC) * 6);
              const dx = Math.abs(to.x - from.x) * 0.45;
              const cx1 = from.x + dx;
              const cx2 = to.x - dx;

              return (
                <g key={`edge-${i}`}>
                  <path d={path} fill="none" stroke={lineBase} strokeWidth={strokeWidth + 3} strokeLinecap="round" />
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(6, strokeWidth * 3)} ${Math.max(10, strokeWidth * 5)}`}
                    style={{ animation: visible ? `dash-flow ${3 + i * 0.5}s linear infinite` : 'none' }}
                  />
                  {visible && edge.count > 0 && [...Array(Math.min(2, Math.max(1, Math.ceil(edge.count / 50))))].map((_, pi) => (
                    <circle key={`p-${i}-${pi}`} r={2.5} fill={edge.tone === 'brand' ? 'url(#particleBrand)' : 'url(#particleAccent)'}>
                      <animateMotion dur={`${2.5 + i * 0.3}s`} begin={`${pi * 1.2}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  ))}
                  <EdgeLabel from={from} to={to} cx1={cx1} cy1={from.y} cx2={cx2} cy2={to.y} count={edge.count} color={strokeColor} isDark={isDark} />
                </g>
              );
            })}

            {/* ---- Nodes ---- */}
            {nodes.map((node, i) => (
              <FlowNode key={node.id} node={node} index={i} visible={visible} isDark={isDark} brandColor={brandColor} accentColor={accentColor} neutralColor={neutralColor} nodeBg={nodeBg} labelColor={labelColor} sublabelColor={sublabelColor} />
            ))}
          </svg>
        </div>

        {isFullscreen && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-text-subtle">
            <Move className="h-3.5 w-3.5" /> Drag to move · Scroll or use + / − to zoom · Esc to close
          </div>
        )}

        <style>{`@keyframes dash-flow { to { stroke-dashoffset: -100; } }`}</style>

        {/* ---- Summary stats + device breakdown in a compact row ---- */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <MiniStat label="Events" value={stats.total.toLocaleString()} icon={ActivityIcon} color={brandColor} />
            <MiniStat label="Impr." value={stats.impressions.toLocaleString()} icon={Eye} color={brandColor} />
            <MiniStat label="Clicks" value={stats.clicks.toLocaleString()} icon={MousePointerClick} color={accentColor} />
            <MiniStat label="CTR" value={`${ctr.toFixed(2)}%`} icon={TrendingUp} color={accentColor} />
          </div>

          {/* Device breakdown */}
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
              <p className="text-[11px] font-semibold text-text-muted">Devices</p>
            </div>
            {deviceBreakdown.length > 0 ? (
              <div className="space-y-1.5">
                {deviceBreakdown.map((d) => {
                  const Icon = deviceIcons[d.device?.toLowerCase()] ?? Globe2;
                  return (
                    <div key={d.device} className="flex items-center gap-2">
                      <Icon className="h-3 w-3 shrink-0 text-text-subtle" />
                      <span className="w-14 shrink-0 capitalize text-[11px] text-text-muted">{d.device}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: visible ? `${d.pct}%` : '0%', transition: 'width 800ms ease' }} />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-text-subtle">
                        {d.count?.toLocaleString() ?? 0} · {d.pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-text-subtle">No device data yet</p>
            )}
          </div>
        </div>
      </div>
  );

  return isFullscreen ? createPortal(panel, document.body) : panel;
}

/* ------------------------------------------------------------------ */

function FlowNode({
  node, index, visible, isDark, brandColor, accentColor, neutralColor, nodeBg, labelColor, sublabelColor,
}: {
  node: FlowNodeData; index: number; visible: boolean; isDark: boolean;
  brandColor: string; accentColor: string; neutralColor: string; nodeBg: string;
  labelColor: string; sublabelColor: string;
}) {
  const Icon = node.icon;
  const color = node.tone === 'brand' ? brandColor : node.tone === 'accent' ? accentColor : neutralColor;
  const r = NODE_R;
  const delay = index * 120;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 0.4s ease ${delay}ms`,
      }}
    >
      <circle r={r + 5} fill="none" stroke={color} strokeWidth={1} opacity={0.12} />
      <circle r={r} fill={nodeBg} stroke={color} strokeWidth={2} filter="url(#nodeGlow)" />
      <circle r={r - 5} fill={color} opacity={0.08} />

      {node.count > 0 && (
        <g transform={`translate(${r - 4}, ${-r + 4})`}>
          <circle r={10} fill={isDark ? '#06070a' : '#ffffff'} stroke={color} strokeWidth={1} />
          <text textAnchor="middle" dy="3" fontSize="9" fontWeight="700" fill={color} style={{ fontFamily: 'Inter, sans-serif' }}>
            {node.count > 999 ? `${(node.count / 1000).toFixed(1)}k` : node.count}
          </text>
        </g>
      )}

      <foreignObject x={-14} y={-14} width={28} height={28}>
        <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          <Icon style={{ width: 20, height: 20 }} />
        </div>
      </foreignObject>

      <text y={r + 16} textAnchor="middle" fontSize="11" fontWeight="600" fill={labelColor} style={{ fontFamily: 'Inter, sans-serif' }}>
        {node.label}
      </text>
      <text y={r + 29} textAnchor="middle" fontSize="9" fill={sublabelColor} style={{ fontFamily: 'Inter, sans-serif' }}>
        {node.sublabel}
      </text>
    </g>
  );
}

function EdgeLabel({
  from, to, cx1, cy1, cx2, cy2, count, color, isDark,
}: {
  from: FlowNodeData; to: FlowNodeData; cx1: number; cy1: number; cx2: number; cy2: number;
  count: number; color: string; isDark: boolean;
}) {
  if (count === 0) return null;
  const mid = bezierPoint(from.x, from.y, cx1, cy1, cx2, cy2, to.x, to.y, 0.5);
  const label = count > 999 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  return (
    <g transform={`translate(${mid.x}, ${mid.y})`} style={{ pointerEvents: 'none' }}>
      <rect x={-15} y={-9} width={30} height={18} rx={5} fill={isDark ? '#06070a' : '#ffffff'} stroke={color} strokeWidth={1} opacity={0.95} />
      <text textAnchor="middle" dy="3" fontSize="9" fontWeight="700" fill={color} style={{ fontFamily: 'Inter, sans-serif' }}>
        {label}
      </text>
    </g>
  );
}

function MiniStat({
  label, value, icon: Icon, color,
}: {
  label: string; value: string; icon: typeof Eye; color: string;
}) {
  return (
    <div className="rounded-lg border border-border-c bg-surface-2 px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3" style={{ color }} />
        <p className="text-[10px] text-text-subtle">{label}</p>
      </div>
      <p className="mt-1 font-display text-sm font-semibold text-text tabular-nums">{value}</p>
    </div>
  );
}
