import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChartBar as BarChart3, Calendar, Copy, Globe as Globe2, List, Monitor, MousePointerClick, Smartphone, Tablet, TrendingUp, X, Zap } from 'lucide-react';
import type { AnalyticsData, EventRow } from '@/lib/data';
import { Skeleton } from '@/components/Skeleton';

function Spinner({ label }: { label: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card p-6 lg:col-span-2">
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-c bg-surface-2 p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-1 h-5 w-20" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6">
        <Skeleton className="h-5 w-24" />
        <div className="mt-5 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
        <Zap className="h-6 w-6 text-brand-500 dark:text-brand-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{sub}</p>
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

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

const deviceIcons: Record<string, typeof BarChart3> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function TrafficStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border-c bg-surface-2 p-3">
      <p className="text-xs text-text-subtle">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-text tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Globe2;
  label: string;
  value?: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-text-subtle">{label}</p>
        <p className={`mt-0.5 break-words text-sm text-text ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function EventDetailsModal({
  event,
  onClose,
}: {
  event: EventRow;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const d = event.event_data;
  const isClick = d.eventName === 'click';
  const screen = d.screenResolution || (d.viewportWidth && d.viewportHeight ? `${d.viewportWidth}x${d.viewportHeight}` : '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="card relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-b-none border-border-c p-6 shadow-2xl animate-slide-up sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              isClick
                ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400'
                : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
            }`}
          >
            {isClick ? <MousePointerClick className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold capitalize text-text">
              {d.eventName || 'unknown'} Event
            </h3>
            <p className="text-xs text-text-subtle">Event Details</p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-border-c">
          <DetailRow icon={Calendar} label="Timestamp" value={formatTimestamp(d.timestamp || '')} />
          <DetailRow icon={Globe2} label="IP Address" value={d.ip} mono />
          <DetailRow icon={Monitor} label="Screen Resolution" value={screen} mono />
          <DetailRow icon={Monitor} label="User Agent" value={d.userAgent} />
          <DetailRow icon={Globe2} label="Page URL" value={d.url} />
          <DetailRow icon={Globe2} label="Country" value={[d.city, d.country].filter(Boolean).join(', ')} />
          <DetailRow icon={Globe2} label="Country Code" value={d.country_code} mono />
          <DetailRow icon={Monitor} label="Device" value={d.device} />
          <DetailRow icon={Globe2} label="Language" value={d.language} />
          <DetailRow icon={Globe2} label="Referrer" value={d.referrer} />
          <DetailRow icon={Globe2} label="Recorded Via" value={d.recordedVia} />
          <DetailRow icon={Globe2} label="Promoted Startup ID" value={d.promoted_id} mono />
        </div>

        <div className="mt-5 rounded-xl border border-border-c bg-surface-2 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-text-subtle">Raw JSON</p>
          <pre className="overflow-x-auto rounded-lg bg-surface-3 p-3 text-xs text-text-subtle">
          {JSON.stringify(event.event_data, null, 2)}
        </pre>
        </div>
      </div>
    </div>
  );
}

function computeStatsFromEvents(events: EventRow[]) {
  const impressions = events.filter((e) => e.event_data.eventName === 'impression').length;
  const clicks = events.filter((e) => e.event_data.eventName === 'click').length;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  const deviceMap = new Map<string, number>();
  for (const e of events) {
    const dev = e.event_data.device || 'unknown';
    deviceMap.set(dev, (deviceMap.get(dev) || 0) + 1);
  }
  const deviceBreakdown = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count, pct: events.length > 0 ? (count / events.length) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);

  const refMap = new Map<string, number>();
  for (const e of events) {
    const ref = e.event_data.referrer || e.event_data.url || '';
    const label = ref ? (() => { try { return new URL(ref).hostname; } catch { return ref; } })() : 'Direct';
    refMap.set(label, (refMap.get(label) || 0) + 1);
  }
  const topReferrers = Array.from(refMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dayMap = new Map<string, { impressions: number; clicks: number }>();
  for (const e of events) {
    const ts = e.event_data.timestamp;
    if (!ts) continue;
    const day = ts.slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { impressions: 0, clicks: 0 });
    const entry = dayMap.get(day)!;
    if (e.event_data.eventName === 'impression') entry.impressions++;
    if (e.event_data.eventName === 'click') entry.clicks++;
  }
  const daily = Array.from(dayMap.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return { totals: { impressions, clicks, ctr }, daily, deviceBreakdown, topReferrers };
}

export function Traffic({
  analytics,
  loading,
  events,
  eventsLoading,
}: {
  analytics: AnalyticsData | null | undefined;
  loading: boolean;
  events: EventRow[] | undefined;
  eventsLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [eventFilter, setEventFilter] = useState<'all' | 'impression' | 'click' | 'hover'>('all');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setStart(true)),
      { threshold: 0.1 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const hasEvents = events && events.length > 0;

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (eventFilter === 'all') return events;
    if (eventFilter === 'hover') return events.filter((e) => e.event_data.hovered === true);
    return events.filter((e) => e.event_data.eventName === eventFilter);
  }, [events, eventFilter]);
  const stats = useMemo(() => {
    if (analytics && analytics.totals.impressions > 0) {
      return analytics;
    }
    if (hasEvents) {
      return computeStatsFromEvents(events!);
    }
    return null;
  }, [analytics, events, hasEvents]);

  if (loading && !hasEvents) return <Spinner label="Loading traffic data…" />;
  if (!stats) {
    return (
      <EmptyState
        title="No traffic data yet"
        sub="Install the bar on your site to start collecting device, country, and referrer data."
      />
    );
  }

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-3">
      <div className="card p-6 lg:col-span-2">
        <p className="font-display text-lg font-semibold text-text">Traffic breakdown</p>
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <TrafficStat label="Impressions" value={stats.totals.impressions} />
            <TrafficStat label="Clicks" value={stats.totals.clicks} />
            <TrafficStat label="CTR" value={stats.totals.ctr.toFixed(2) + '%'} />
          </div>
        </div>

        {stats.daily.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs text-text-subtle">Daily impressions vs clicks</p>
            <div className="space-y-2">
              {stats.daily.slice(-7).map((d) => {
                const maxImp = Math.max(1, ...stats.daily.map((x) => x.impressions));
                return (
                  <div key={d.day}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-mono text-text-subtle">{d.day.slice(5)}</span>
                      <span className="text-text-muted tabular-nums">
                        {d.impressions} imp · {d.clicks} clicks
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                        style={{
                          width: start ? `${(d.impressions / maxImp) * 100}%` : '0%',
                          transition: 'width 900ms ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="font-display text-lg font-semibold text-text">Devices</p>
        {stats.deviceBreakdown.length > 0 ? (
          <div className="mt-5 space-y-5">
            {stats.deviceBreakdown.map((d) => {
              const Icon = deviceIcons[d.device?.toLowerCase()] ?? Globe2;
              return (
                <div key={d.device}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 capitalize text-text-muted">
                      <Icon className="h-4 w-4 text-text-subtle" /> {d.device}
                    </span>
                    <span className="text-text-muted tabular-nums">{d.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400"
                      style={{ width: start ? `${d.pct}%` : '0%', transition: 'width 900ms ease' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-subtle">No device data yet</p>
        )}

        <div className="mt-6 border-t border-border-c pt-5">
          <p className="text-xs uppercase tracking-wider text-text-subtle">Top referrers</p>
          {stats.topReferrers.length > 0 ? (
            <div className="mt-3 space-y-2">
              {stats.topReferrers.map((r) => (
                <div key={r.referrer} className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{r.referrer}</span>
                  <span className="text-text-subtle tabular-nums">{r.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-subtle">No referrer data yet</p>
          )}
        </div>
      </div>

      {/* Raw events table */}
      <div className="card overflow-hidden lg:col-span-3">
        <div className="flex flex-col gap-3 border-b border-border-c px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            <h3 className="font-display text-lg font-semibold text-text">Raw events</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-border-c bg-surface-2 p-1">
              {([
                { id: 'all', label: 'All' },
                { id: 'impression', label: 'Impression' },
                { id: 'click', label: 'Click' },
                { id: 'hover', label: 'Hover' },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setEventFilter(f.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    eventFilter === f.id
                      ? 'bg-brand-500 text-white dark:bg-brand-400 dark:text-ink-950'
                      : 'text-text-muted hover:bg-surface-3 hover:text-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-subtle">
              {events ? `${filteredEvents.length} of ${events.length}` : 'Loading…'}
            </span>
          </div>
        </div>
        {eventsLoading ? (
          <div className="divide-y divide-border-c">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm"> 
              <thead>
                <tr className="border-b border-border-c text-left text-xs uppercase tracking-wider text-text-subtle">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">URL (show your ads )</th>
                  <th className="px-4 py-3 font-medium">Language</th>
                  <th className="px-4 py-3 font-medium">Recorded via</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead> 
              <tbody className="divide-y divide-border-c">
                {filteredEvents.map((ev, i) => {
                  const d = ev.event_data;
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedEvent(ev)}
                      className="cursor-pointer transition-colors hover:bg-surface-2"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                            d.eventName === 'click'
                              ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400'
                              : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          }`}
                        >
                          {d.eventName || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-text-muted">{d.device || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-subtle">{d.ip || '—'}</td>
                      <td className="px-4 py-3">
                        {d.url ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard?.writeText(d.url!);
                            }}
                            className="inline-flex max-w-[420px] items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-brand-500 dark:hover:text-brand-400"
                            title="Click to copy URL"
                          >
                            <span className="truncate">{d.url}</span>
                            <Copy className="h-3 w-3 shrink-0 text-text-subtle" />
                          </button>
                        ) : (
                          <span className="text-text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{d.language || '—'}</td>
                      <td className="px-4 py-3 text-text-muted">{d.recordedVia || '—'}</td>
                      <td className="px-4 py-3 text-xs text-text-subtle">{d.timestamp ? timeAgo(d.timestamp) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-text-subtle">
            {events && events.length > 0
              ? `No ${eventFilter} events match this filter.`
              : 'No events recorded yet. Install the bar on your site to start collecting traffic data.'}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
