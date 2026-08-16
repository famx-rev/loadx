import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Network } from '@/components/Network';
import { fetchLeaderboard } from '@/lib/data';
import type { LeaderboardEntry } from '@/lib/data';
import { useRouter } from '@/lib/router';

export function NetworkPage() {
  const { navigate } = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lb = await fetchLeaderboard();
        if (!cancelled) setLeaderboard(lb);
      } catch {
        if (!cancelled) setLeaderboard([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <div className="container-px py-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="h-display text-2xl font-semibold text-text">The Network</h1>
            <p className="text-sm text-text-muted">Every startup in the Loadbar network, ranked by reach.</p>
          </div>
        </div>
 
        <div className="mt-8">
          <Network
            leaderboard={leaderboard}
            loading={leaderboard === undefined}
            onOpenProject={(id) => navigate(`/p/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
