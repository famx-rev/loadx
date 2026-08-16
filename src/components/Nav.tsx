import { useEffect, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Wordmark } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';

const links = [
  { label: 'How it works', href: '/#how' },
  { label: 'Network', href: '/network' },
  { label: 'Leaderboard', href: '/#leaderboard' },
];

export function Nav() {
  const { isAuthenticated, logout } = useAuth();
  const { route, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [route.path]);

  const go = (href: string) => {
    setOpen(false);
    if (href.includes('#') && href.startsWith('/#')) {
      const id = href.slice(2);
      if (route.path === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border-c bg-[var(--c-nav-bg)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-px flex h-16 items-center justify-between">
        <Wordmark onClick={() => go('/')} />

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => go(l.href)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn-ghost">
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn-dark"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost">
                Sign in
              </button>
              <button onClick={() => navigate('/join')} className="btn-primary btn-shine">
                Join the network
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-c bg-surface-2 text-text lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border-c bg-[var(--c-nav-bg)] backdrop-blur-xl lg:hidden">
          <div className="container-px flex flex-col gap-1 py-4">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.href)}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-muted hover:bg-surface-3 hover:text-text"
              >
                {l.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border-c pt-3">
              {isAuthenticated ? (
                <>
                  <button onClick={() => navigate('/dashboard')} className="btn-ghost w-full">
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="btn-dark w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="btn-ghost w-full">
                    Sign in
                  </button>
                  <button onClick={() => navigate('/join')} className="btn-primary w-full">
                    Join the network
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
