import { useEffect, useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export interface BarStartup {
  name: string;
  tagline: string;
  domain: string;
  url: string;
  accent_from?: string;
  accent_to?: string;
}

const fallbackStartups: BarStartup[] = [
  {
    name: 'Acme AI',
    tagline: 'turn meeting notes into action items, automatically',
    domain: 'acme.ai',
    url: 'https://acme.ai',
    accent_from: '#3dd79e',
    accent_to: '#0b9a6c',
  },
  {
    name: 'AISuperMenu',
    tagline: 'AISuperMenu is a smart digital menu for restaurants',
    domain: 'aisupermenu.com',
    url: 'https://aisupermenu.com',
    accent_from: '#ff7c38',
    accent_to: '#ec4208',
  },
  {
    name: 'Quill',
    tagline: 'write docs that feel like magic, together',
    domain: 'quill.so',
    url: 'https://quill.so',
    accent_from: '#38bdf8',
    accent_to: '#0284c7',
  },
  {
    name: 'Pingdrop',
    tagline: 'collect feedback from users without a single form',
    domain: 'pingdrop.io',
    url: 'https://pingdrop.io',
    accent_from: '#fb7185',
    accent_to: '#e11d48',
  },
  {
    name: 'Folio',
    tagline: 'a portfolio that builds itself from your GitHub',
    domain: 'folio.dev',
    url: 'https://folio.dev',
    accent_from: '#fbbf24',
    accent_to: '#d97706',
  },
];

function gradient(s: BarStartup) {
  const from = s.accent_from || '#3dd79e';
  const to = s.accent_to || '#0b9a6c';
  return `linear-gradient(135deg, ${from}, ${to})`;
}

export function LoadbarDemo({
  variant = 'browser',
  className = '',
  startups,
  rotateInterval = 4200,
  onVisit,
}: {
  variant?: 'browser' | 'plain';
  className?: string;
  startups?: BarStartup[];
  rotateInterval?: number;
  onVisit?: (s: BarStartup) => void;
}) {
  const list = startups && startups.length > 0 ? startups : fallbackStartups;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), rotateInterval);
    return () => clearInterval(t);
  }, [list.length, rotateInterval]);

  const s = list[idx] ?? list[0];

  const bar = (
    <div className="relative flex h-9 w-full items-center gap-3 overflow-hidden border-b border-border-c bg-surface-3 px-3 backdrop-blur">
      <div className="flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded" style={{ background: gradient(s) }} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Loadbar
        </span>
      </div>
      <span className="h-3.5 w-px bg-border-c" />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
          style={{ background: gradient(s) }}
        >
          {s.name[0]?.toUpperCase()}
        </span>
        <p className="truncate text-xs text-text-muted">
          <span className="font-semibold text-text">{s.name}</span>
          <span className="text-text-subtle"> — {s.tagline}</span>
        </p>
      </div>
      <button
        onClick={() => onVisit?.(s)}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-text transition-colors hover:bg-surface-3"
      >
        Visit <ArrowUpRight className="h-3 w-3" />
      </button>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 animate-bar-scroll bg-gradient-to-r from-transparent via-brand-400/10 to-transparent"
        aria-hidden
      />
    </div>
  );

  if (variant === 'plain') return bar;

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 border-b border-border-c bg-surface-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md border border-border-c bg-surface-3 px-3 py-1">
          <Sparkles className="h-3 w-3 text-text-subtle" />
          <span className="text-xs text-text-muted">yourstartup.com</span>
        </div>
      </div>
      <div className="relative">
        {bar}
        <div className="grid-bg flex h-56 items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-surface-3" />
            <div className="mx-auto mb-2 h-3 w-40 rounded bg-surface-3" />
            <div className="mx-auto mb-4 h-3 w-28 rounded bg-surface-3" />
            <div className="mx-auto flex w-44 gap-2">
              <div className="h-7 flex-1 rounded-lg bg-surface-3" />
              <div className="h-7 flex-1 rounded-lg bg-surface-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
