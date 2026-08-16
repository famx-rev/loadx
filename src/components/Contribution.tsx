import { useCallback, useEffect, useState } from 'react';
import { Calendar, Eye, Globe as Globe2, Monitor, MousePointerClick, Smartphone, Tablet, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchEvents } from '@/lib/data';
import type { EventRow } from '@/lib/data';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';

function timeAgo(iso: string): string {
  if (!iso) return '—';
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
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function deviceIcon(device?: string) {
  if (device === 'mobile') return <Smartphone className="h-4 w-4" />;
  if (device === 'tablet') return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-c py-2.5 last:border-0">
      <span className="inline-flex items-center gap-2 text-sm text-text-muted">
        <Icon className="h-4 w-4 text-text-subtle" /> {label}
      </span>
      <span className="max-w-[60%] truncate text-sm font-medium text-text">{value || '—'}</span>
    </div>
  );
}

export function Contribution({ startupId }: { startupId: string }) {
  const { token } = useAuth();
  const [events, setEvents] = useState<EventRow[] | undefined>(undefined);
  const [selected, setSelected] = useState<EventRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const ev = await fetchEvents(token, startupId, 'gave');
      setEvents(ev);
    } catch {
      setEvents([]);
    }
  }, [token, startupId]);

  useEffect(() => {
    load();
  }, [load]);

  if (events === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="divide-y divide-border-c">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <Skeleton className="h-5 w-28" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border-c py-2.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const impressions = events.filter((e) => e.event_data.eventName === 'impression').length;
  const clicks = events.filter((e) => e.event_data.eventName === 'click').length;
  const hovered = events.filter((e) => e.event_data.hovered).length;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';

  const cards = [
    { label: 'Impressions given', value: impressions.toLocaleString(), icon: Eye },
    { label: 'Clicks given', value: clicks.toLocaleString(), icon: MousePointerClick },
    { label: 'Hovered', value: hovered.toLocaleString(), icon: Zap },
    { label: 'CTR', value: `${ctr}%`, icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <c.icon className="h-4 w-4" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-text tabular-nums">{c.value}</p>
            <p className="text-sm text-text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event table */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
            <h3 className="font-display text-lg font-semibold text-text">Your contributions</h3>
            <span className="text-xs text-text-subtle">{events.length} events</span>
          </div>
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs text-text-subtle">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-c">
                  {events.map((ev, i) => {
                    const d = ev.event_data;
                    return (
                      <tr
                        key={i}
                        onClick={() => setSelected(ev)}
                        className="cursor-pointer transition-colors hover:bg-surface-2"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            {d.eventName === 'click' ? (
                              <MousePointerClick className="h-3.5 w-3.5 text-accent-500 dark:text-accent-400" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                            )}
                            <span className="text-text">{d.eventName || '—'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-text-muted">
                            {deviceIcon(d.device)}
                            <span className="capitalize">{d.device || '—'}</span>
                          </span>
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-xs text-text-subtle">
                          {d.url || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-text-subtle">
                          {d.timestamp ? timeAgo(d.timestamp) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <Zap className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-text">No contributions yet</h3>
              <p className="mt-2 max-w-sm text-sm text-text-muted">
                When your widget shows other startups and visitors interact, your contributions will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold text-text">Event details</h3>
          {selected ? (
            <div className="mt-4">
              <DetailRow icon={Eye} label="Event" value={selected.event_data.eventName || '—'} />
              <DetailRow icon={Monitor} label="Device" value={selected.event_data.device || '—'} />
              <DetailRow icon={Globe2} label="URL" value={selected.event_data.url || '—'} />
              <DetailRow icon={Calendar} label="Timestamp" value={formatTimestamp(selected.event_data.timestamp || '')} />
              <DetailRow icon={Eye} label="Screen" value={selected.event_data.screenResolution || '—'} />
              <DetailRow icon={Globe2} label="Language" value={selected.event_data.language || '—'} />
              <DetailRow icon={Eye} label="Hovered" value={selected.event_data.hovered ? 'Yes' : 'No'} />
              <DetailRow icon={Eye} label="Recorded via" value={selected.event_data.recordedVia || '—'} />
              <DetailRow icon={Eye} label="Viewport" value={`${selected.event_data.viewportWidth || '?'}x${selected.event_data.viewportHeight || '?'}`} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-subtle">Select an event from the table to see full details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
