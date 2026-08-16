import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-c bg-surface-2 text-text-muted transition-all hover:border-brand-400/40 hover:text-brand-500 ${className}`}
    >
      <span className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-brand-400/0 transition-all group-hover:ring-brand-400/20" />
    </button>
  );
}
