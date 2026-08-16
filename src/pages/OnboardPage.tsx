import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChartBar as BarChart3, CircleCheck as CheckCircle2, Globe as Globe2, LayoutGrid, Loader as Loader2, Plus, Rocket, Share2, Sparkles, Trash2, TrendingUp, Users, X } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { LoadbarDemo, type BarStartup } from '@/components/LoadbarDemo';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { useCountUp, useReveal } from '@/lib/hooks';
import {
  createStartup,
  DataError,
  deleteStartup,
  fetchLeaderboard,
  fetchMyStartups,
} from '@/lib/data';
import type { LeaderboardEntry, Startup } from '@/lib/data';

type WizardStep = 1 | 2 | 3;

export function OnboardPage() {
  const { user, token } = useAuth();
  const { navigate } = useRouter();
  const [startups, setStartups] = useState<Startup[] | undefined>(undefined);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [celebrating, setCelebrating] = useState<Startup | null>(null);

  const loadStartups = useCallback(async () => {
    if (!token) return;
    try {
      const s = await fetchMyStartups(token);
      setStartups(s);
    } catch {
      setStartups([]);
    }
  }, [token]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const lb = await fetchLeaderboard();
      setLeaderboard(lb);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  useEffect(() => {
    loadStartups();
    loadLeaderboard();
  }, [loadStartups, loadLeaderboard]);

  const handleCreated = (s: Startup) => {
    setStartups((prev) => [s, ...(prev ?? [])]);
    setWizardStep(3);
    setCelebrating(s);
  };

  const finishCelebration = () => {
    const s = celebrating;
    setCelebrating(null);
    setWizardStep(1);
    if (s) navigate(`/dashboard/${s.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      await deleteStartup(token, id);
      setStartups((prev) => (prev ?? []).filter((s) => s.id !== id));
    } catch {
      /* best effort */
    } finally {
      setDeletingId(null);
    }
  };

  const hasStartups = (startups?.length ?? 0) > 0;
  const networkCount = useCountUp(leaderboard?.length ?? 0, 1000, true);

  if (startups === undefined) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container-px py-10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
          <Skeleton className="mt-1 h-4 w-64" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3 celebration: full-screen overlay, auto-advances in 5s ──
  if (wizardStep === 3 && celebrating) {
    return (
      <CelebrationOverlay startup={celebrating} onContinue={finishCelebration} />
    );
  }

  // ── Step 2: inline form ──
  if (wizardStep === 2) {
    return (
      <div className="flex min-h-screen flex-col justify-center pb-8 pt-20">
        <div className="container-px w-full">
          <StepIndicator currentStep={wizardStep} />
          <div className="mx-auto mt-6 max-w-xl">
            <WizardForm
              token={token}
              onBack={() => setWizardStep(1)}
              onCreated={handleCreated}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── First-time landing (step 1) ──
  if (!hasStartups) {
    return (
      <div className="flex min-h-screen flex-col justify-center pb-8 pt-20">
        <div className="container-px w-full">
          <EmptyStateLanding
            onStart={() => setWizardStep(2)}
            networkCount={networkCount}
            onSeeNetwork={() => navigate('/dashboard?tab=network')}
          />
        </div>
      </div>
    );
  }

  // ── Has startups: project chooser console ──
  return (
    <div className="min-h-screen pb-8 pt-24">
      <div className="container-px">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="h-display text-2xl font-semibold text-text">Your startups</h1>
              <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-semibold text-text-muted">
                {startups!.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Select a startup to view its dashboard, or create a new one.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border-c bg-surface-2 p-0.5">
              <button
                onClick={() => setView('grid')}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  view === 'grid' ? 'bg-surface-3 text-text' : 'text-text-subtle hover:text-text'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  view === 'list' ? 'bg-surface-3 text-text' : 'text-text-subtle hover:text-text'
                }`}
                title="List view"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => setWizardStep(2)} className="btn-primary btn-shine">
              <Plus className="h-4 w-4" />
              New startup
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {startups!.map((s) => (
              <StartupCard
                key={s.id}
                startup={s}
                onOpen={() => navigate(`/dashboard/${s.id}`)}
                onDelete={() => handleDelete(s.id)}
                deleting={deletingId === s.id}
              />
            ))}
            <button
              onClick={() => setWizardStep(2)}
              className="group flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-c text-center transition-colors hover:border-brand-500/40 hover:bg-brand-500/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 transition-transform group-hover:scale-110">
                <Plus className="h-5 w-5 text-text-muted" />
              </div>
              <p className="mt-2.5 text-sm font-medium text-text-muted">New startup</p>
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border-c bg-surface-2">
            {startups!.map((s, i) => (
              <button
                key={s.id}
                onClick={() => navigate(`/dashboard/${s.id}`)}
                className={`flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-3 ${
                  i > 0 ? 'border-t border-border-c' : ''
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${s.accent_from}, ${s.accent_to})` }}
                >
                  {s.name[0]?.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">
                    {s.name}
                    {Boolean(s.verified) && (
                      <CheckCircle2 className="ml-1.5 inline h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                    )}
                  </p>
                  <p className="truncate text-xs text-text-subtle">{s.domain}</p>
                </div>
                <span className="hidden text-xs text-text-subtle sm:block">{s.tagline}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-text-subtle" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Step indicator                                                    */
/* ================================================================== */

function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const steps = [
    { num: 1, label: 'Welcome' },
    { num: 2, label: 'Startup details' },
    { num: 3, label: 'Done' },
  ];

  return (
    <div className="mx-auto flex max-w-xl items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                currentStep > s.num
                  ? 'bg-brand-500 text-white dark:bg-brand-400 dark:text-ink-950'
                  : currentStep === s.num
                    ? 'step-glow-active bg-brand-500 text-white dark:bg-brand-400 dark:text-ink-950'
                    : 'bg-surface-3 text-text-subtle'
              }`}
            >
              {currentStep > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                currentStep >= s.num ? 'text-text' : 'text-text-subtle'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-6 transition-colors duration-500 sm:w-12 ${
                currentStep > s.num ? 'bg-brand-500 dark:bg-brand-400' : 'bg-border-c'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Step 1 — Landing (empty state)                                   */
/* ================================================================== */

function EmptyStateLanding({
  onStart,
  networkCount,
  onSeeNetwork,
}: {
  onStart: () => void;
  networkCount: number;
  onSeeNetwork: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero CTA card */}
      <div className="relative overflow-hidden rounded-2xl border border-border-c bg-surface-2 p-6 sm:p-8">
        <div className="glow-orb -left-10 -top-10 h-48 w-48 bg-brand-500/20 dark:bg-brand-400/10" />
        <div className="glow-orb -right-10 top-20 h-56 w-56 bg-accent-500/15 dark:bg-accent-500/8" />
        <div className="grid-bg absolute inset-0 opacity-50" />

        <div className="relative mx-auto max-w-xl text-center">
          <span className="eyebrow inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
            Welcome to Loadbar
          </span>
          <h2 className="h-display mt-3 text-2xl text-text sm:text-3xl text-balance">
            Create your first startup to join the network
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted text-balance">
            Add your startup details, install the bar on your site, and start exchanging traffic
            with other founders — free, forever.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={onStart} className="btn-primary btn-shine px-5 py-2.5 text-sm">
              <Rocket className="h-4 w-4" />
              Create your startup
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onSeeNetwork} className="btn-ghost px-5 py-2.5 text-sm">
              <Users className="h-4 w-4" />
              Browse the network
            </button>
          </div>
          <p className="mt-3 text-xs text-text-subtle">
            <span className="font-display text-base font-semibold text-text tabular-nums">
              {networkCount.toLocaleString()}
            </span>{' '}
            startups already in the network
          </p>
        </div>
      </div>

      {/* How it works — 3 steps */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Rocket, title: 'Create', desc: 'Add your startup name, website URL, and a short tagline.' },
          { icon: Share2, title: 'Install', desc: 'Paste one script tag on your site. The bar loads automatically.' },
          { icon: TrendingUp, title: 'Grow', desc: 'Your startup appears across the network. Get free traffic.' },
        ].map((s, i) => (
          <HowStep key={s.title} step={s} index={i} />
        ))}
      </div>

      {/* Live bar preview */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-subtle">
          Live bar preview
        </p>
        <div className="overflow-hidden rounded-xl border border-border-c">
          <LoadbarDemo variant="plain" rotateInterval={3500} />
        </div>
      </div>
    </div>
  );
}

function HowStep({
  step,
  index,
}: {
  step: { icon: typeof Rocket; title: string; desc: string };
  index: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref as never}
      className="reveal card card-hover group relative p-5"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 transition-transform duration-300 group-hover:scale-110">
          <step.icon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
        </div>
        <span className="font-display text-xs font-bold uppercase tracking-wider text-text-subtle">
          Step {index + 1}
        </span>
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold text-text">{step.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">{step.desc}</p>
    </div>
  );
}

/* ================================================================== */
/*  Step 2 — Inline form                                             */
/* ================================================================== */

function WizardForm({
  token,
  onBack,
  onCreated,
}: {
  token: string | null;
  onBack: () => void;
  onCreated: (p: Startup) => void;
}) {
  const [form, setForm] = useState({ name: '', domain: '', tagline: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const result = await createStartup(token, {
        name: form.name,
        domain: form.domain,
        tagline: form.tagline,
        url: form.url,
      });
      onCreated(result);
    } catch (err) {
      setError(err instanceof DataError ? err.message : 'Could not create. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cardClass = 'card gradient-border overflow-hidden animate-step-in';

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-c px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10">
            <Rocket className="h-4 w-4 text-brand-500 dark:text-brand-400" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-text">Tell us about your startup</h3>
            <p className="text-xs text-text-subtle">This is how other founders will see you</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={save} className="space-y-3 p-5">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-sm text-red-400 animate-slide-down">
            {error}
          </div>
        )}

        <div>
          <label className="label text-xs" htmlFor="c-name">Startup name</label>
          <input
            id="c-name"
            type="text"
            maxLength={60}
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme AI"
            className="input py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="label text-xs" htmlFor="c-url">Website URL</label>
          <input
            id="c-url"
            type="url"
            maxLength={300}
            required
            value={form.url}
            onChange={(e) => {
              const raw = e.target.value;
              let domain = form.domain;
              try {
                const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
                const host = parsed.hostname.replace(/^www\./, '');
                if (host && host.includes('.')) domain = host;
              } catch {
                /* keep existing domain while URL is incomplete */
              }
              setForm({ ...form, url: raw, domain });
            }}
            placeholder="https://acme.ai"
            className="input py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="label text-xs" htmlFor="c-domain">
            Domain <span className="font-normal text-text-subtle">(auto-filled from your URL)</span>
          </label>
          <input
            id="c-domain"
            type="text"
            maxLength={100}
            required
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            placeholder="acme.ai"
            className="input py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="label text-xs" htmlFor="c-tagline">Tagline</label>
          <input
            id="c-tagline"
            type="text"
            maxLength={120}
            required
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="Turn meeting notes into action items"
            className="input py-1.5 text-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-ghost py-1.5 text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <button type="submit" disabled={saving} className="btn-primary btn-shine py-1.5 text-sm disabled:opacity-60">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            {saving ? 'Creating…' : 'Create startup'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================================================================== */
/*  Step 3 — Full-screen celebration overlay (auto-advances 5s)      */
/* ================================================================== */

const CONFETTI_COLORS = [
  '#3dd79e', '#0b9a6c', '#f59e0b', '#ef4444',
  '#3b82f6', '#a855f7', '#ec4899', '#fbbf24',
];

function CelebrationOverlay({
  startup,
  onContinue,
}: {
  startup: Startup;
  onContinue: () => void;
}) {
  const gradient = `linear-gradient(135deg, ${startup.accent_from}, ${startup.accent_to})`;
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onContinue();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onContinue]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 3 + Math.random() * 2.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 10,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-ink-950/95 backdrop-blur-md animate-fade-in">
      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-0">
        {pieces.map((p) => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              transform: `rotate(${p.rotation}deg)`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center animate-celebrate">
        {/* Glow ring behind badge */}
        <div className="relative">
          <div
            className="absolute inset-0 animate-ping rounded-full opacity-20"
            style={{ background: gradient }}
          />
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-glow"
            style={{ background: gradient }}
          >
            <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="h-display mt-6 text-3xl font-semibold text-white sm:text-4xl">
          Hooray!
        </h2>
        <p className="mt-2 max-w-md text-sm text-white/70">
          <span className="font-semibold text-white">{startup.name}</span> is now live on the
          Loadbar network.
        </p>

        {/* Realistic browser mockup showing the Loadbar live on their site */}
        <BrowserLoadbarPreview startup={startup} gradient={gradient} />

        {/* Auto-advance hint + manual button */}
        <button
          onClick={onContinue}
          className="btn-primary btn-shine mt-6 px-5 py-2.5 text-sm"
        >
          Go to dashboard
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-xs text-white/40">
          Taking you to your dashboard in {countdown}s…
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Realistic browser preview — shows the Loadbar on the user's site */
/* ================================================================== */

function BrowserLoadbarPreview({ startup, gradient }: { startup: Startup; gradient: string }) {
  const domain = startup.url.replace(/^https?:\/\//, '');
  const [activeBar, setActiveBar] = useState(0);

  const networkStartups: BarStartup[] = useMemo(() => {
    const base: BarStartup[] = [
      {
        name: 'Quill',
        tagline: 'write docs that feel like magic',
        domain: 'quill.so',
        url: 'https://quill.so',
        accent_from: '#38bdf8',
        accent_to: '#0284c7',
      },
      {
        name: 'Pingdrop',
        tagline: 'collect feedback without a single form',
        domain: 'pingdrop.io',
        url: 'https://pingdrop.io',
        accent_from: '#fb7185',
        accent_to: '#e11d48',
      },
      {
        name: 'Folio',
        tagline: 'a portfolio that builds itself',
        domain: 'folio.dev',
        url: 'https://folio.dev',
        accent_from: '#fbbf24',
        accent_to: '#d97706',
      },
    ];
    return base;
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveBar((i) => (i + 1) % networkStartups.length);
    }, 1800);
    return () => clearInterval(t);
  }, [networkStartups.length]);

  const featured = networkStartups[activeBar];
  const featuredGradient = `linear-gradient(135deg, ${featured.accent_from}, ${featured.accent_to})`;

  return (
    <div className="mt-5 w-full max-w-md animate-slide-up">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
        Here's the Loadbar on your site
      </p>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-white px-2 py-1 ring-1 ring-gray-200">
            <svg className="h-2.5 w-2.5 shrink-0 text-gray-400" viewBox="0 0 12 12" fill="none">
              <path d="M3 5.5L4.5 4M4.5 4L6 5.5M4.5 4V8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="truncate text-[10px] text-gray-500">{domain}</span>
          </div>
        </div>

        {/* The Loadbar — realistic rendering on a white site background */}
        <div className="relative">
          <div className="flex h-8 w-full items-center gap-2 overflow-hidden border-b border-gray-200 bg-white px-3">
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-3.5 w-3.5 items-center justify-center rounded text-[7px] font-black text-white"
                style={{ background: gradient }}
              >
                {startup.name[0]?.toUpperCase()}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Loadbar
              </span>
            </div>
            <span className="h-3 w-px bg-gray-200" />
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span
                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-[7px] font-bold text-white"
                style={{ background: featuredGradient }}
              >
                {featured.name[0]?.toUpperCase()}
              </span>
              <p className="truncate text-[10px] text-gray-500">
                <span className="font-semibold text-gray-800">{featured.name}</span>
                <span className="text-gray-400"> — {featured.tagline}</span>
              </p>
            </div>
            <button className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-600">
              Visit
              <ArrowUpRight className="h-2 w-2" />
            </button>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-20 animate-bar-scroll bg-gradient-to-r from-transparent via-gray-300/20 to-transparent"
              aria-hidden
            />
          </div>

          {/* Fake website content beneath the bar */}
          <div className="bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-md"
                  style={{ background: gradient }}
                />
                <span className="text-[10px] font-bold text-gray-800">{startup.name}</span>
              </div>
              <div className="flex gap-2.5">
                <div className="h-1.5 w-6 rounded bg-gray-200" />
                <div className="h-1.5 w-6 rounded bg-gray-200" />
                <div className="h-1.5 w-6 rounded bg-gray-200" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2.5 w-3/4 rounded bg-gray-800" />
              <div className="h-2.5 w-1/2 rounded bg-gray-200" />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-gray-100" />
              <div className="h-1.5 w-5/6 rounded bg-gray-100" />
              <div className="h-1.5 w-2/3 rounded bg-gray-100" />
            </div>
            <div className="mt-3 flex gap-2">
              <div
                className="h-5 w-16 rounded-md"
                style={{ background: gradient }}
              />
              <div className="h-5 w-12 rounded-md bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Startup card (grid view)                                         */
/* ================================================================== */

function StartupCard({
  startup,
  onOpen,
  onDelete,
  deleting,
}: {
  startup: Startup;
  onOpen: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const gradient = `linear-gradient(135deg, ${startup.accent_from}, ${startup.accent_to})`;
  const created = new Date(startup.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onOpen}
      className="group card card-hover spotlight relative cursor-pointer overflow-hidden p-4"
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: gradient }} />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={deleting}
        className="absolute right-3 top-3 z-10 inline-flex h-6 w-6 items-center justify-center rounded-lg text-text-subtle opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
        title="Delete startup"
      >
        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      </button>

      <div className="flex items-start justify-between pr-6">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold text-white shadow-card transition-transform duration-300 group-hover:scale-105"
          style={{ background: gradient }}
        >
          {startup.name[0]?.toUpperCase()}
        </span>
        {Boolean(startup.verified) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-300">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </span>
        )}
      </div>

      <h4 className="mt-3 font-display text-sm font-semibold text-text">{startup.name}</h4>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">{startup.tagline}</p>

      <div className="mt-3 space-y-2 border-t border-border-c pt-2.5">
        <div className="flex items-center gap-1.5 text-xs text-text-subtle">
          <Globe2 className="h-3 w-3 shrink-0" />
          <span className="truncate font-mono">{startup.url.replace(/^https?:\/\//, '')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-subtle">Created {created}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-300">
            Open dashboard
            <ArrowUpRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}