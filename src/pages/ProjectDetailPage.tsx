import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Calendar, CircleCheck as CheckCircle2, ExternalLink, Globe as Globe2, MousePointerClick, Share2, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { fetchStartupById, fetchLeaderboard } from '@/lib/data';
import type { LeaderboardEntry, Startup } from '@/lib/data';
import { Skeleton } from '@/components/Skeleton';

export function ProjectDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const [startup, setStartup] = useState<Startup | null | undefined>(undefined);
  const [rank, setRank] = useState<LeaderboardEntry | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchStartupById(id)
      .then((s) => {
        if (active) setStartup(s);
      })
      .catch(() => {
        if (active) {
          setError('Could not load this project');
          setStartup(null);
        }
      });
    fetchLeaderboard()
      .then((lb) => {
        if (active) setRank(lb.find((l) => l.id === id) ?? null);
      })
      .catch(() => {
        if (active) setRank(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (startup === undefined) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container-px py-10">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-5">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="mt-4 h-7 w-16" />
                    <Skeleton className="mt-2 h-4 w-20" />
                  </div>
                ))}
              </div>
              <div className="card overflow-hidden">
                <div className="border-b border-border-c px-6 py-4">
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="divide-y divide-border-c">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-4">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="card overflow-hidden">
                <div className="border-b border-border-c px-5 py-3">
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-36" />
              </div>
            </div>
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
        <h1 className="font-display text-2xl font-semibold text-text">Project not found</h1>
        <p className="max-w-sm text-sm text-text-muted">
          {error || 'This project may have been removed or is no longer part of the network.'}
        </p>
        <button onClick={() => navigate('/dashboard?tab=network')} className="btn-primary mt-2">
          <ArrowLeft className="h-4 w-4" /> Back to network
        </button>
      </div>
    );
  }

  const gradient = `linear-gradient(135deg, ${startup.accent_from}, ${startup.accent_to})`;
  const createdDate = new Date(startup.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hasStats = rank && (rank.impressions > 0 || rank.clicks > 0);
  const ctr = rank && rank.impressions > 0 ? ((rank.clicks / rank.impressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen pt-16">
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-border-c">
        <div className="absolute inset-0 opacity-10" style={{ background: gradient }} />
        <div className="glow-orb left-1/4 top-0 h-64 w-64 opacity-30" style={{ background: startup.accent_from }} />

        <div className="container-px relative py-12 sm:py-16">
          <button
            onClick={() => navigate('/dashboard?tab=network')}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Back to network
          </button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-card"
              style={{ background: gradient }}
            >
              {startup.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="h-display text-3xl font-semibold text-text sm:text-4xl">{startup.name}</h1>
                {Boolean(startup.verified) && (
                  <CheckCircle2 className="h-6 w-6 text-brand-500 dark:text-brand-400" />
                )}
              </div>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-text-muted">{startup.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4" /> {startup.domain}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Joined {createdDate}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={startup.url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-shine">
                <ExternalLink className="h-4 w-4" /> Visit site
              </a>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="btn-ghost"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-px py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Details */}
          <div className="lg:col-span-2">
            {/* Stats */}
            {rank === undefined ? (
              <div className="mb-6 grid gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-5">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="mt-4 h-7 w-16" />
                    <Skeleton className="mt-2 h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : hasStats ? (
              <div className="mb-6 grid gap-4 sm:grid-cols-4">
                <StatCard icon={TrendingUp} label="Impressions" value={rank.impressions.toLocaleString()} />
                <StatCard icon={MousePointerClick} label="Clicks" value={rank.clicks.toLocaleString()} />
                <StatCard icon={Zap} label="CTR" value={`${ctr}%`} />
                <StatCard icon={Trophy} label="Rank" value={`#${rank.rank}`} />
              </div>
            ) : (
              <div className="card mb-6 flex flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                  <Zap className="h-6 w-6 text-brand-500 dark:text-brand-400" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-text">No traffic data yet</h3>
                <p className="mt-1.5 max-w-sm text-sm text-text-muted">
                  This startup hasn't received any impressions or clicks in the last 7 days.
                </p>
              </div>
            )}

            {/* Info list */}
            <div className="card overflow-hidden">
              <div className="border-b border-border-c px-6 py-4">
                <h2 className="font-display text-lg font-semibold text-text">Project details</h2>
              </div>
              <div className="divide-y divide-border-c">
                <DetailRow icon={Globe2} label="Domain" value={startup.domain} />
                <DetailRow icon={ExternalLink} label="Website" value={startup.url} link />
                <DetailRow
                  icon={CheckCircle2}
                  label="Status"
                  value={Boolean(startup.verified) ? 'Verified & live' : 'Pending approval'}
                />
                <DetailRow icon={Calendar} label="Joined" value={createdDate} />
                <DetailRow
                  icon={Trophy}
                  label="Network rank"
                  value={rank ? `#${rank.rank} of all startups` : 'Not ranked yet'}
                />
              </div>
            </div>
          </div>

          {/* Sidebar — bar preview */}
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="border-b border-border-c px-5 py-3">
                <p className="text-xs uppercase tracking-wider text-text-subtle">Live bar preview</p>
              </div>
              <div className="relative flex h-9 w-full items-center gap-3 border-b border-border-c bg-surface-3 px-3 backdrop-blur">
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded" style={{ background: gradient }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Loadbar</span>
                </div>
                <span className="h-3.5 w-px bg-border-c" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                    style={{ background: gradient }}
                  >
                    {startup.name[0]?.toUpperCase()}
                  </span>
                  <p className="truncate text-xs text-text-muted">
                    <span className="font-semibold text-text">{startup.name}</span>
                    <span className="text-text-subtle"> — {startup.tagline}</span>
                  </p>
                </div>
                <a
                  href={startup.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-text transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  Visit <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
              <div className="grid-bg flex h-40 items-center justify-center px-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-10 w-10 rounded-xl" style={{ background: gradient }} />
                  <p className="text-xs text-text-subtle">{startup.domain}</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-5 w-5 shrink-0 text-brand-500 dark:text-brand-400" />
                <div>
                  <p className="text-sm font-medium text-text">Part of the Loadbar network</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    This startup's bar is shown across the network, and in return it features other
                    founders' startups on its own site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 font-display text-2xl font-semibold text-text tabular-nums">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-text-subtle">{label}</p>
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 truncate text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {value.replace(/^https?:\/\//, '')}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </a>
        ) : (
          <p className="mt-0.5 truncate text-sm font-medium text-text">{value}</p>
        )}
      </div>
    </div>
  );
}
