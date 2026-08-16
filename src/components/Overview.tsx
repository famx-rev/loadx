import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Trophy,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Link2,
  Clock,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { useCountUp } from '@/lib/hooks';
import { useRouter } from '@/lib/router';
import { useTheme } from '@/lib/theme';
import type { AnalyticsData, EventRow, LeaderboardEntry } from '@/lib/data';
import { TrafficVisualization } from '@/components/TrafficVisualization';

export function Spinner({ label }: { label: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="mt-4 h-7 w-20" />
            <Skeleton className="mt-2 h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="card p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-1 h-3 w-24" />
        <div className="mt-6 flex items-end gap-2" style={{ height: 260 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${20 + ((i * 37) % 60)}%` }} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-6">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1.5 h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
        <Zap className="h-6 w-6 text-brand-500 dark:text-brand-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{sub}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

const deviceIcon = (device: string) => {
  const d = device?.toLowerCase() ?? '';
  if (d === 'mobile') return Smartphone;
  if (d === 'tablet') return Tablet;
  return Monitor;
};

/* ---- Range switcher (M / H / W / MO / Y) ---- */
type Range = 'M' | 'H' | 'W' | 'MO' | 'Y';

const RANGES: { key: Range; label: string; title: string }[] = [
  { key: 'M',  label: 'Min', title: 'By Minute (last 24 h)' },
  { key: 'H',  label: 'Hr',  title: 'By Hour (last 24 h)' },
  { key: 'W',  label: '7D',  title: 'By Day (last 7 days)' },
  { key: 'MO', label: '30D', title: 'By Day (last 30 days)' },
  { key: 'Y',  label: 'Yr',  title: 'By Month (last 12 months)' },
];

function bucketLabel(date: Date, range: Range): string {
  if (range === 'M')  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  if (range === 'H')  return `${pad2(date.getHours())}:00`;
  if (range === 'W')  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  if (range === 'MO') return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function cutoffDate(range: Range): Date {
  const now = new Date();
  if (range === 'M')  return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === 'H')  return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === 'W')  return new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  if (range === 'MO') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
}

function getEventTimestamp(e: EventRow): string | null {
  const ts = e.event_data?.timestamp;
  if (ts) return ts;
  // Supabase-created events may store timestamp in event_data;
  // the row itself doesn't expose created_at in EventRow type, so fall back.
  return null;
}

function buildTimeData(events: EventRow[], range: Range) {
  const from = cutoffDate(range);
  const buckets: Record<string, { events: number; impressions: number; clicks: number }> = {};
  for (const e of events) {
    const ts = getEventTimestamp(e);
    if (!ts) continue;
    const d = new Date(ts);
    if (d < from) continue;
    const key = bucketLabel(d, range);
    if (!buckets[key]) buckets[key] = { events: 0, impressions: 0, clicks: 0 };
    buckets[key].events += 1;
    if (e.event_data?.eventName === 'impression') buckets[key].impressions += 1;
    else if (e.event_data?.eventName === 'click') buckets[key].clicks += 1;
  }
  return Object.entries(buckets)
    .map(([time, v]) => ({ time, events: v.events, impressions: v.impressions, clicks: v.clicks }))
    .sort((a, b) => {
      // For minute/hour ranges, sort chronologically by the time string
      if (range === 'M' || range === 'H') {
        return a.time.localeCompare(b.time);
      }
      // For day/month ranges, parse the date for proper ordering
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
}

export function Overview({
  analytics,
  leaderboard,
  loading,
  events,
  eventsLoading,
}: {
  analytics: AnalyticsData | null | undefined;
  leaderboard: LeaderboardEntry[] | undefined;
  loading: boolean;
  events?: EventRow[];
  eventsLoading?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { navigate } = useRouter();
  const [range, setRange] = useState<Range>('M');

  const chartGridStroke = isDark ? '#374151' : '#e5e7eb';
  const chartTickFill = isDark ? '#9ca3af' : '#6b7280';
  const chartTooltipStyle: React.CSSProperties = {
    borderRadius: 10,
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    fontSize: 13,
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#111827',
  };

  /* ---- Fallback: compute stats from raw events when backend totals are 0 ---- */
  const fallbackStats = useMemo(() => {
    if (!events || events.length === 0) return null;
    const impressions = events.filter((e) => e.event_data?.eventName === 'impression').length;
    const clicks = events.filter((e) => e.event_data?.eventName === 'click').length;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    return { impressions, clicks, ctr };
  }, [events]);

  const apiImpressions = analytics?.totals.impressions ?? 0;
  const apiClicks = analytics?.totals.clicks ?? 0;
  const apiCtr = analytics ? analytics.totals.ctr : 0;

  const useFallback = (apiImpressions === 0 && apiClicks === 0) && fallbackStats && (fallbackStats.impressions > 0 || fallbackStats.clicks > 0);

  const impressions = useFallback ? fallbackStats!.impressions : apiImpressions;
  const clicks = useFallback ? fallbackStats!.clicks : apiClicks;
  const ctr = (useFallback ? fallbackStats!.ctr : apiCtr).toFixed(2);

  const myRank = useMemo(() => {
    if (!analytics) return null;
    return leaderboard?.find((l) => l.impressions <= impressions)?.rank ?? null;
  }, [analytics, leaderboard, impressions]);

  /* ---- Build chart data from events ---- */
  const chartData = useMemo(() => {
    if (!events || events.length === 0) return [];
    return buildTimeData(events, range);
  }, [events, range]);

  const eventTypeData = useMemo(() => {
    if (!events || events.length === 0) return [];
    const m: Record<string, number> = {};
    for (const e of events) {
      const name = e.event_data?.eventName || 'unknown';
      m[name] = (m[name] || 0) + 1;
    }
    return Object.entries(m).map(([type, count]) => ({ type, count }));
  }, [events]);

  const activeRange = RANGES.find((r) => r.key === range)!;

  if (loading && eventsLoading) return <Spinner label="Loading your analytics…" />;

  if (!analytics && (!events || events.length === 0) && !fallbackStats) {
    return (
      <EmptyState
        title="No analytics yet"
        sub="Once you install the bar on your site, your impressions and clicks will show up here in real time."
        action={
          <button onClick={() => navigate('/dashboard?tab=settings')} className="btn-primary">
            Install the bar
          </button>
        }
      />
    );
  }

  const cards = [
    { label: 'Impressions', value: impressions.toLocaleString(), icon: Eye, tone: 'brand' as const },
    { label: 'Clicks', value: clicks.toLocaleString(), icon: MousePointerClick, tone: 'accent' as const },
    { label: 'CTR', value: `${ctr}%`, icon: TrendingUp, tone: 'brand' as const },
    { label: 'Network rank', value: myRank ? `#${myRank}` : '—', icon: Trophy, tone: 'accent' as const },
  ];

  const totalDevices = analytics?.deviceBreakdown.reduce((s, d) => s + d.count, 0) ?? 0;
  const maxReferrer = Math.max(1, ...(analytics?.topReferrers.map((r) => r.count) ?? []));
  const hasChart = chartData.length > 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  c.tone === 'brand'
                    ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                    : 'bg-accent-500/10 text-accent-500 dark:text-accent-400'
                }`}
              >
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-text tabular-nums">{c.value}</p>
            <p className="text-sm text-text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Ad Flow Visualization */}
      <TrafficVisualization
        analytics={analytics}
        events={events}
        loading={loading}
        eventsLoading={eventsLoading}
      />

      {/* Events Timeline chart with M / H / W / MO / Y switcher */}
      <div className="card p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            <div>
              <h2 className="font-display text-lg font-semibold text-text">Events Timeline</h2>
              <p className="mt-0.5 text-xs text-text-subtle">{activeRange.title}</p>
            </div>
          </div>

          {/* Range switcher */}
          <div className="flex items-center gap-0.5 rounded-xl border border-border-c bg-surface-2 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`min-w-[40px] rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  range === r.key
                    ? 'bg-brand-500 text-white shadow-sm dark:bg-brand-400 dark:text-ink-950'
                    : 'text-text-muted hover:bg-surface-3 hover:text-text'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {hasChart ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart accessibilityLayer={false} tabIndex={-1} className="overview-chart" onMouseDown={(event) => event.preventDefault()} data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="eventsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3dd79e" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3dd79e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: chartTickFill }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: chartTickFill }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="events"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#eventsGrad)"
                dot={false}
                activeDot={{ r: 4 }}
                name="Events"
              />
              <Area
                type="monotone"
                dataKey="impressions"
                stroke="#3dd79e"
                strokeWidth={2}
                fill="url(#impressionsGrad)"
                dot={false}
                activeDot={{ r: 4 }}
                name="Impressions"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#clicksGrad)"
                dot={false}
                activeDot={{ r: 4 }}
                name="Clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-60 items-center justify-center text-sm text-text-subtle">
            No data for this period
          </div>
        )}
      </div>

      {/* Top countries + Event Types bar chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top countries */}
        <div className="card p-6">
          <p className="font-display text-lg font-semibold text-text">Top countries</p>
          {analytics && analytics.topCountries.length > 0 ? (
            <div className="mt-4 space-y-3">
              {analytics.topCountries.slice(0, 6).map((c) => {
                const pct = analytics.totals.impressions > 0
                  ? Math.round((c.count / analytics.totals.impressions) * 100)
                  : 0;
                return (
                  <div key={c.country}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-muted">
                        {c.country_code && (
                          <span className="mr-2 inline-flex h-4 w-6 items-center justify-center rounded bg-surface-3 text-[9px] font-semibold">
                            {c.country_code}
                          </span>
                        )}
                        {c.country}
                      </span>
                      <span className="text-text-subtle tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                        style={{ width: `${pct}%`, transition: 'width 900ms ease' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-subtle">No country data yet</p>
          )}
        </div>

        {/* Event Types bar chart */}
        <div className="card p-6">
          <p className="font-display text-lg font-semibold text-text">Event Types Distribution</p>
          {eventTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart accessibilityLayer={false} tabIndex={-1} className="overview-chart" onMouseDown={(event) => event.preventDefault()} data={eventTypeData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 12, fill: chartTickFill }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: chartTickFill }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-text-subtle">
              No event data yet
            </div>
          )}
        </div>
      </div>

      {/* Daily impressions/clicks area chart (from analytics.daily) */}
      {analytics && analytics.daily.length > 0 && (
        <div className="card p-6">
          <p className="font-display text-lg font-semibold text-text">Daily Impressions vs Clicks</p>
          <p className="mt-0.5 text-xs text-text-subtle">Last 14 days</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart accessibilityLayer={false} tabIndex={-1} className="overview-chart" onMouseDown={(event) => event.preventDefault()} data={analytics.daily} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dailyImpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3dd79e" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3dd79e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dailyClkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: chartTickFill }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: chartTickFill }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3dd79e"
                  strokeWidth={2}
                  fill="url(#dailyImpGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Impressions"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#dailyClkGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Device breakdown + Top referrers */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Device breakdown */}
        <div className="card p-6">
          <p className="font-display text-lg font-semibold text-text">Device breakdown</p>
          {analytics && analytics.deviceBreakdown.length > 0 ? (
            <div className="mt-4 space-y-4">
              {analytics.deviceBreakdown.map((d) => {
                const Icon = deviceIcon(d.device);
                const pct = totalDevices > 0 ? Math.round((d.count / totalDevices) * 100) : 0;
                return (
                  <div key={d.device}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 text-text-muted">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="capitalize">{d.device || 'Unknown'}</span>
                      </span>
                      <span className="text-text-subtle tabular-nums">{d.count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-300"
                        style={{ width: `${pct}%`, transition: 'width 900ms ease' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-subtle">No device data yet</p>
          )}
        </div>

        {/* Top referrers */}
        <div className="card p-6">
          <p className="font-display text-lg font-semibold text-text">Top referrers</p>
          {analytics && analytics.topReferrers.length > 0 ? (
            <div className="mt-4 space-y-3">
              {analytics.topReferrers.map((r) => {
                const pct = Math.round((r.count / maxReferrer) * 100);
                return (
                  <div key={r.referrer}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 truncate text-text-muted">
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{r.referrer || 'Direct'}</span>
                      </span>
                      <span className="shrink-0 text-text-subtle tabular-nums">{r.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                        style={{ width: `${pct}%`, transition: 'width 900ms ease' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-subtle">No referrer data yet</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            <p className="font-display text-lg font-semibold text-text">Recent activity</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-text-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-glow dark:bg-brand-400" /> Live
          </span>
        </div>
        {analytics && analytics.activity.length > 0 ? (
          <div className="mt-4 divide-y divide-border-c">
            {analytics.activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span className="flex h-7 w-9 items-center justify-center rounded bg-surface-3 text-[10px] font-semibold text-text-muted">
                  {a.country_code || '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text">
                    Visit from <span className="font-medium">{a.city || a.country || 'Unknown'}</span>
                  </p>
                  <p className="text-xs text-text-subtle">
                    {a.referrer || 'Direct'} · {a.device || 'Unknown'}
                  </p>
                </div>
                <span className="text-xs text-text-subtle">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-subtle">No visits recorded yet</p>
        )}
      </div>
    </div>
  );
}
