import { Zap } from 'lucide-react';

export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className && ''}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
        <Zap className="h-4 w-4 text-ink-950" strokeWidth={2.5} />
      </span>
    </span>
  );
}

export function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow transition-transform group-hover:scale-105">
        <Zap className="h-4 w-4 text-ink-950" strokeWidth={2.5} />
      </span>
      <span className="font-display text-text">
        Load<span className="text-brand-500 dark:text-brand-400">bar</span>
      </span>
    </button>
  );
}
