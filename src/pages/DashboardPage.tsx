import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, ChartBar as BarChart3, CircleCheck as CheckCircle2, Copy, Globe as Globe2, Link2, Loader as Loader2, Rocket, Settings, Trash2, TrendingUp, Users, Zap } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { LoadbarDemo } from '@/components/LoadbarDemo';
import type { BarStartup } from '@/components/LoadbarDemo';
import { Network } from '@/components/Network';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import {
  DataError,
  deleteAllEvents,
  deleteStartup,
  fetchAnalytics,
  fetchEvents,
  fetchLeaderboard,
  fetchMyStartups,
  fetchStartupById,
  updateStartup,
} from '@/lib/data';
import type { AnalyticsData, EventRow, LeaderboardEntry, Startup } from '@/lib/data';
import { Traffic } from '@/components/Traffic';
import { TrafficVisualization } from '@/components/TrafficVisualization';
import { Contribution } from '@/components/Contribution';
import { Overview } from '@/components/Overview';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'traffic', label: 'Traffic', icon: TrendingUp },
  { id: 'flow', label: 'Flow', icon: Activity },
  { id: 'contribution', label: 'Contribution', icon: Zap },
  { id: 'network', label: 'Network', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function DashboardPage({ startupId }: { startupId: string }) {
  const { user, token } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<TabId>('overview');
  const [startup, setStartup] = useState<Startup | null | undefined>(undefined);
  const [analytics, setAnalytics] = useState<AnalyticsData | null | undefined>(undefined);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | undefined>(undefined);
  const [myStartups, setMyStartups] = useState<Startup[]>([]);
  const [events, setEvents] = useState<EventRow[] | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex >= 0) {
      const params = new URLSearchParams(hash.slice(qIndex + 1));
      const t = params.get('tab');
      if (t && tabs.some((x) => x.id === t)) setTab(t as TabId);
    }
  }, []);

  const loadStartup = useCallback(async () => {
    try {
      const s = await fetchStartupById(startupId);
      setStartup(s);
    } catch {
      setStartup(null);
    }
  }, [startupId]);

  const loadAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const a = await fetchAnalytics(token, startupId);
      setAnalytics(a);
    } catch {
      setAnalytics(null);
    }
  }, [token, startupId]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const lb = await fetchLeaderboard();
      setLeaderboard(lb);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  const loadMyStartups = useCallback(async () => {
    if (!token) return;
    try {
      const s = await fetchMyStartups(token);
      setMyStartups(s);
    } catch {
      setMyStartups([]);
    }
  }, [token]);

  const loadEvents = useCallback(async () => {
    if (!token) return;
    try {
      const ev = await fetchEvents(token, startupId);
      setEvents(ev);
    } catch {
      setEvents([]);
    }
  }, [token, startupId]);

  useEffect(() => {
    loadStartup();
    loadAnalytics();
    loadLeaderboard();
    loadMyStartups();
    loadEvents();
  }, [loadStartup, loadAnalytics, loadLeaderboard, loadMyStartups, loadEvents]);

  const selectTab = (id: TabId) => {
    setTab(id);
    const base = window.location.hash.split('?')[0];
    window.location.hash = `${base}?tab=${id}`;
  };

  const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'Founder';

  const profileBarData: BarStartup[] | undefined = useMemo(() => {
    if (!startup) return undefined;
    return [
      {
        name: startup.name,
        tagline: startup.tagline,
        domain: startup.domain,
        url: startup.url,
        accent_from: startup.accent_from,
        accent_to: startup.accent_to,
      },
    ];
  }, [startup]);

  if (startup === undefined) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container-px py-10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-40" />
          <div className="mt-8 flex gap-1 rounded-xl border border-border-c bg-surface-2 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 flex-1 rounded-lg" />
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="mt-4 h-7 w-20" />
                <Skeleton className="mt-2 h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="mt-6 card p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (startup === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 pt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-3">
          <Globe2 className="h-8 w-8 text-text-subtle" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-text">Startup not found</h1>
        <p className="max-w-sm text-sm text-text-muted">
          This startup may have been deleted or you don't have access to it.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-2">
          <ArrowLeft className="h-4 w-4" /> Back to your startups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container-px py-10">
        {/* Header with startup switcher */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="h-display truncate text-2xl font-semibold text-text">{startup.name}</h1>
              {Boolean(startup.verified) && <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500 dark:text-brand-400" />}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500 shadow-glow dark:bg-brand-400" />
              <a
                href={startup.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-text-muted transition-colors hover:text-brand-500 dark:hover:text-brand-400"
              >
                {startup.url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Startup switcher dropdown */}
            <div className="relative">
              <select
                value={startupId}
                onChange={(e) => navigate(`/dashboard/${e.target.value}`)}
                className="appearance-none rounded-xl border border-border-c bg-surface-2 px-4 py-2.5 pr-9 text-sm font-medium text-text transition-colors hover:bg-surface-3 focus:border-brand-500 focus:outline-none"
              >
                {myStartups.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.domain}
                  </option>
                ))}
              </select>
              <Globe2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl border border-border-c bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-brand-500 text-white dark:bg-brand-400 dark:text-ink-950 shadow-glow'
                  : 'text-text-muted hover:bg-surface-3 hover:text-text'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-8">
          {tab === 'overview' && (
            <Overview
              analytics={analytics}
              leaderboard={leaderboard}
              loading={analytics === undefined}
              events={events}
              eventsLoading={events === undefined}
            />
          )}
          {tab === 'traffic' && (
            <Traffic
              analytics={analytics}
              loading={analytics === undefined}
              events={events}
              eventsLoading={events === undefined}
            />
          )}
          {tab === 'flow' && (
            <TrafficVisualization
              analytics={analytics}
              loading={analytics === undefined}
              events={events}
              eventsLoading={events === undefined}
            />
          )}
          {tab === 'contribution' && (
            <Contribution startupId={startupId} />
          )}
          {tab === 'network' && (
            <Network
              leaderboard={leaderboard}
              loading={leaderboard === undefined}
              onOpenProject={(id) => navigate(`/p/${id}`)}
            />
          )}
          {tab === 'settings' && (
            <SettingsTab
              startup={startup}
              token={token}
              profileBarData={profileBarData}
              onSaved={(p) => {
                setStartup(p);
                loadAnalytics();
                loadLeaderboard();
              }}
              onDataDeleted={() => {
                loadAnalytics();
                loadEvents();
                loadLeaderboard();
              }}
              onDeleted={() => navigate('/dashboard')}
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings tab — edit + delete                                      */
/* ------------------------------------------------------------------ */

const buildSnippet = (id: string) => `<!-- paste anywhere on your site -->
<script
  src="https://loadapi.vercel.app/api/widget/loader.js"
  data-startup-id="${id}"
></script>`;

function SettingsTab({
  startup,
  token,
  profileBarData,
  onSaved,
  onDataDeleted,
  onDeleted,
  user,
}: {
  startup: Startup;
  token: string | null;
  profileBarData?: BarStartup[];
  onSaved: (p: Startup) => void;
  onDataDeleted: () => void;
  onDeleted: () => void;
  user: { email?: string; username?: string; id?: string } | null;
}) {
  const { navigate } = useRouter();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPurge, setShowPurge] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purged, setPurged] = useState(false);
  const [form, setForm] = useState({
    name: startup.name,
    domain: startup.domain,
    tagline: startup.tagline,
    url: startup.url,
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setForm({
      name: startup.name,
      domain: startup.domain,
      tagline: startup.tagline,
      url: startup.url,
    });
  }, [startup]);

  const copy = () => {
    navigator.clipboard?.writeText(buildSnippet(startup.id)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const result = await updateStartup(token, startup.id, {
        name: form.name,
        domain: form.domain,
        tagline: form.tagline,
        url: form.url,
      });
      onSaved(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      setError(err instanceof DataError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await deleteStartup(token, startup.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof DataError ? err.message : 'Could not delete. Please try again.');
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const confirmPurge = async () => {
    if (!token) return;
    setPurging(true);
    try {
      await deleteAllEvents(token, startup.id);
      onDataDeleted();
      setPurged(true);
      setTimeout(() => setPurged(false), 2400);
    } catch (err) {
      setError(err instanceof DataError ? err.message : 'Could not delete data. Please try again.');
    } finally {
      setPurging(false);
      setShowPurge(false);
    }
  };

  const startupId = startup.id;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Install snippet */}
      <div className="card p-6">
        <p className="font-display text-lg font-semibold text-text">Install the bar</p>
        <p className="mt-1 text-sm text-text-muted">
          Paste this snippet anywhere in your site's HTML. It loads asynchronously and won't slow
          your page down.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border-c bg-[var(--c-code-bg)]">
          <div className="flex items-center justify-between border-b border-border-c px-4 py-2.5">
            <span className="font-mono text-xs text-text-muted">yourstartup.com / index.html</span>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-c bg-surface-3 px-2.5 py-1 text-xs text-text-muted transition-colors hover:text-text"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-text-muted">
            <code>
              <span className="text-text-subtle">{`<!-- paste anywhere on your site -->\n`}</span>
              <span className="text-accent-500 dark:text-accent-400">{'<script'}</span>
              {'\n  '}
              <span className="text-brand-600 dark:text-brand-300">src</span>=
              <span className="text-amber-600 dark:text-amber-300">"https://loadapi.vercel.app/api/widget/loader.js"</span>
              {'\n  '}
              <span className="text-brand-600 dark:text-brand-300">data-startup-id</span>=
              <span className="text-amber-600 dark:text-amber-300">{`"${startupId}"`}</span>
              {'\n'}
              <span className="text-accent-500 dark:text-accent-400">{'></script>'}</span>
            </code>
          </pre>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-500/20 bg-brand-500/10 px-3.5 py-2.5 text-sm text-brand-600 dark:text-brand-300">
          <Link2 className="h-4 w-4 shrink-0" />
          Your startup ID: <span className="font-mono font-semibold">{startupId}</span>
        </div>

        <p className="mt-4 text-xs uppercase tracking-wider text-text-subtle">Live preview</p>
        <div className="mt-2 overflow-hidden rounded-xl border border-border-c">
          <LoadbarDemo variant="plain" startups={profileBarData} rotateInterval={99999} />
        </div>
      </div>

      {/* Edit profile + delete */}
      <div className="space-y-6">
        <div className="card p-6">
          <p className="font-display text-lg font-semibold text-text">Startup profile</p>
          <p className="mt-1 text-sm text-text-muted">This is how other founders see your startup in the bar.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300 animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={save} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="s-name">Startup name</label>
              <input id="s-name" type="text" maxLength={60} required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme AI" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="s-domain">Domain</label>
              <input id="s-domain" type="text" maxLength={100} required value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="acme.ai" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="s-tagline">Tagline</label>
              <input id="s-tagline" type="text" maxLength={120} required value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="turn meeting notes into action items" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="s-url">Website URL</label>
              <input id="s-url" type="url" maxLength={300} required value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://acme.ai" className="input" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 animate-slide-down">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>

          <div className="mt-6 border-t border-border-c pt-5">
            <p className="text-xs uppercase tracking-wider text-text-subtle">Account</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Email</span>
                <span className="text-text">{user?.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Username</span>
                <span className="text-text">{user?.username || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone — purge data */}
        <div className="card overflow-hidden border-red-500/20">
          <div className="border-b border-red-500/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h3 className="font-display text-lg font-semibold text-text">Delete all data</h3>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Wipe every impression and click recorded for this startup. The startup itself stays in the network.
            </p>
          </div>
          <div className="px-6 py-4">
            {purged ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 animate-slide-down">
                <CheckCircle2 className="h-4 w-4" /> All data deleted.
              </span>
            ) : !showPurge ? (
              <button
                onClick={() => setShowPurge(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" /> Delete all analytics data
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">
                  This will permanently delete all impressions and clicks for <span className="font-semibold text-text">{startup.name}</span>. This cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={confirmPurge}
                    disabled={purging}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                  >
                    {purging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {purging ? 'Deleting…' : 'Yes, delete all data'}
                  </button>
                  <button onClick={() => setShowPurge(false)} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger zone — delete startup */}
        <div className="card overflow-hidden border-red-500/20">
          <div className="border-b border-red-500/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h3 className="font-display text-lg font-semibold text-text">Delete startup</h3>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Permanently remove this startup from the network. This cannot be undone.
            </p>
          </div>
          <div className="px-6 py-4">
            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" /> Delete this startup
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">
                  Are you sure? All analytics data for <span className="font-semibold text-text">{startup.name}</span> will be permanently lost.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {deleting ? 'Deleting…' : 'Yes, delete forever'}
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
