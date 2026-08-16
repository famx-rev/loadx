import { Github, Heart, Twitter } from 'lucide-react';
import { Wordmark } from './Logo';
import { useRouter } from '@/lib/router';

const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', to: '/#how' },
      { label: 'The bar', to: '/#bar' },
      { label: 'Analytics', to: '/#network' },
      { label: 'Leaderboard', to: '/#leaderboard' },
    ],
  },
  {
    title: 'Network',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Join the network', to: '/join' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Apply your startup', to: '/join' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Support', to: '/#support' },
      { label: 'Privacy', to: '/#privacy' },
      { label: 'Terms', to: '/#terms' },
    ],
  },
];

export function Footer() {
  const { navigate } = useRouter();
  const go = (to: string) => {
    if (to.includes('#') && to.startsWith('/#')) {
      const id = to.slice(2);
      if (window.location.hash.replace(/^#/, '').split('?')[0] === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    } else {
      navigate(to);
    }
  };

  return (
    <footer className="relative border-t border-border-c bg-surface-2">
      <div className="container-px py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark onClick={() => go('/')} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Founders helping founders get their first traffic. One line of code, infinite reach.
              Free forever.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-c bg-surface-3 text-text-muted transition-colors hover:text-text"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-c bg-surface-3 text-text-muted transition-colors hover:text-text"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => go(l.to)}
                      className="text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-c pt-6 sm:flex-row">
          <p className="text-xs text-text-subtle">© 2026 Loadbar. Built for founders, by founders.</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-text-subtle">
            Made with <Heart className="h-3.5 w-3.5 fill-accent-500 text-accent-500" /> for indie
            hackers
          </p>
        </div>
      </div>
    </footer>
  );
}
