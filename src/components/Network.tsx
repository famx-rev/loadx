import { ArrowUpRight, CircleCheck as CheckCircle2, Globe as Globe2, TrendingUp, Trophy, Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/data';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/Skeleton';

export function Network({
  leaderboard,
  loading,
  onOpenProject,
}: {
  leaderboard: LeaderboardEntry[] | undefined;
  loading: boolean;
  onOpenProject: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card aspect-square p-5">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="mt-4 h-5 w-24" />
              <Skeleton className="mt-2 h-3 w-36" />
            </div>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="divide-y divide-border-c">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const networkSize = leaderboard?.length ?? 0;
  const totalImpressions = leaderboard?.reduce((sum, l) => sum + l.impressions, 0) ?? 0;
  const totalClicks = leaderboard?.reduce((s, l) => s + l.clicks, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Network size', value: networkSize.toLocaleString(), icon: Users, sub: 'active startups' },
          { label: 'Total impressions', value: totalImpressions.toLocaleString(), icon: TrendingUp, sub: 'across all startups (7d)' },
          { label: 'Total clicks', value: totalClicks.toLocaleString(), icon: ArrowUpRight, sub: 'across all startups (7d)' },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <c.icon className="h-4 w-4" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-text tabular-nums">{c.value}</p>
            <p className="text-sm text-text-muted">{c.label}</p>
            <p className="mt-1 text-xs text-text-subtle">{c.sub}</p>
          </div>
        ))}
      </div>

      {leaderboard && leaderboard.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            <h3 className="font-display text-lg font-semibold text-text">All projects in the network</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {leaderboard.map((l) => (
              <button
                key={l.id}
                onClick={() => onOpenProject(l.id)}
                className="group card card-hover spotlight relative aspect-square overflow-hidden p-5 text-left"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: `linear-gradient(90deg, ${l.accent_from}, ${l.accent_to})` }}
                />
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-card transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${l.accent_from}, ${l.accent_to})` }}
                    >
                      {l.name[0]?.toUpperCase()}
                    </span>
                    {Boolean(l.verified) && <CheckCircle2 className="h-4 w-4 text-brand-500 dark:text-brand-400" />}
                  </div>
                  <h4 className="mt-4 font-display text-lg font-semibold text-text">{l.name}</h4>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">{l.tagline}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border-c pt-3">
                    <span className="font-mono text-xs text-text-subtle">{l.domain}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                      View
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            <h3 className="font-display text-lg font-semibold text-text">Leaderboard</h3>
          </div>
          <span className="text-xs text-text-subtle">Ranked by impressions (7 days)</span>
        </div>
        {leaderboard && leaderboard.length > 0 ? (
          <div className="divide-y divide-border-c">
            {leaderboard.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-surface-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    l.rank === 1
                      ? 'bg-brand-500 text-white dark:bg-brand-400 dark:text-ink-950'
                      : l.rank === 2
                        ? 'bg-ink-200 text-ink-950 dark:bg-ink-300 dark:text-ink-950'
                        : l.rank === 3
                          ? 'bg-accent-500/80 text-white'
                          : 'bg-surface-3 text-text-muted'
                  }`}
                >
                  {l.rank}
                </span>
                <button onClick={() => onOpenProject(l.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${l.accent_from}, ${l.accent_to})` }}
                  >
                    {l.name[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {l.name}
                      {Boolean(l.verified) && <CheckCircle2 className="ml-1.5 inline h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />}
                    </p>
                    <p className="truncate text-xs text-text-subtle">{l.domain}</p>
                  </div>
                </button>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-text tabular-nums">{l.impressions.toLocaleString()}</p>
                  <p className="text-xs text-text-subtle">impressions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text tabular-nums">{l.clicks.toLocaleString()}</p>
                  <p className="text-xs text-text-subtle">clicks</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-text-subtle">
            No startups in the network yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}
