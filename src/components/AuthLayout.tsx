import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from '@/lib/router';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { navigate } = useRouter();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="glow-orb -left-20 top-20 h-72 w-72 bg-brand-500/25" />
      <div className="glow-orb -right-20 bottom-20 h-72 w-72 bg-accent-500/15" />

      <div className="relative flex min-h-screen flex-col">
        <div className="container-px flex h-16 items-center justify-between">
          <Wordmark onClick={() => navigate('/')} />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            <div className="card p-7 sm:p-8 animate-fade-up">
              <h1 className="h-display text-2xl font-semibold text-text">{title}</h1>
              <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>
            {footer && <div className="mt-5 text-center text-sm text-text-muted">{footer}</div>}
          </div>
        </div>

        <div className="container-px flex h-16 items-center justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </button>
        </div>
      </div>
    </div>
  );
}
