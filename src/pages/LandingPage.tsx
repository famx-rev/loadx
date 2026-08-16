import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChartBar as BarChart3, CircleCheck as CheckCircle2, Code as Code2, Copy, Eye, MousePointerClick, Sparkles, TrendingUp, Trophy, Users, Zap } from 'lucide-react';
import { Globe } from '@/components/Globe';
import { LoadbarDemo } from '@/components/LoadbarDemo';
import { Reveal, SectionHeading } from '@/components/Reveal';
import { useCountUp, useReveal } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { fetchLeaderboard } from '@/lib/data';
import type { LeaderboardEntry } from '@/lib/data';

const log = [
  'Embed bar → promotes a verified startup',
  'They embed → your startup gets featured back',
  'Bigger network = more reach for everyone',
];

const snippet = `<!-- paste anywhere on your site -->
<script
  src="https://loadbar.co/widget/loader.js"
  data-startup-id="YOUR_ID"
></script>`;

const features = [
  { icon: Eye, title: 'Real Impressions', desc: 'Only visible views count' },
  { icon: MousePointerClick, title: 'Click Tracking', desc: 'Know exactly who clicked' },
  { icon: BarChart3, title: 'Traffic Analytics', desc: 'Country, device, referrer' },
  { icon: Trophy, title: 'Network Rank', desc: 'See where you stand' },
  { icon: Users, title: 'Founder Network', desc: 'Reach startup audiences' },
  { icon: TrendingUp, title: 'Mutual Growth', desc: 'More founders = more reach' },
];

const steps = [
  {
    num: '01',
    title: 'You promote others. Others promote you.',
    points: log,
    visual: 'promote',
  },
  {
    num: '02',
    title: 'One line of code. Infinite reach.',
    points: [
      'Works on Next.js, Webflow, WordPress — anything',
      'Async load — zero impact on page speed',
      'Auto-updated, always shows the best match',
    ],
    visual: 'code',
  },
  {
    num: '03',
    title: 'Every impression. Every click. Tracked.',
    points: [
      'Real impressions — visible in viewport only',
      'Country, device, referrer — all free',
      'Verified traffic badge on your listing',
    ],
    visual: 'analytics',
  },
];

export function LandingPage() {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();

  const goToAuth = () => navigate(isAuthenticated ? '/dashboard' : '/join');

  return (
    <main>
      <Hero onCta={goToAuth} />
      <HowItWorks />
      <LiveNetwork />
      <WhyItWorks onCta={goToAuth} />
      <FinalCta onCta={goToAuth} />
    </main>
  );
}

function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);
  return { ref, onMouseMove };
}

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="mesh-bg relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="glow-orb -left-20 top-10 h-72 w-72 bg-brand-500/30 animate-glow" />
      <div className="glow-orb right-0 top-40 h-80 w-80 bg-accent-500/20 animate-glow" style={{ animationDelay: '1.5s' }} />

      <div className="container-px relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-glow" />
              Free forever · No money, ever
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="h-display mt-6 text-4xl leading-[1.05] text-text sm:text-6xl md:text-7xl text-balance">
              Founders helping founders
              <br />
              get their{' '}
              <span className="gradient-text-animate text-shadow-glow">first traffic.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg text-balance">
              Add one line of code. A small bar appears on your site showing another founder's
              startup. In return, yours gets shown on theirs.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={onCta} className="btn-primary btn-shine px-6 py-3 text-base">
                Add your startup <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost px-6 py-3 text-base"
              >
                See how it works
              </button>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-text-subtle">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-500 dark:text-brand-400" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-500 dark:text-brand-400" /> 2-minute setup
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-500 dark:text-brand-400" /> Cancel anytime
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={320} className="mx-auto mt-16 max-w-3xl">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-text-subtle">
            The Loadbar widget ✦ (this is how it looks on your site)
          </p>
          <div className="animate-float" style={{ animationDuration: '8s' }}>
            <LoadbarDemo />
          </div>
        </Reveal>

        <Reveal delay={380} className="mt-10">
          <StartupMarquee />
        </Reveal>
      </div>
    </section>
  );
}

const fallbackNames = [
  'Acme AI', 'Quill', 'Pingdrop', 'Folio', 'AISuperMenu', 'Devflow', 'Pixelhaus',
  'Notably', 'Outreachr', 'Stackwise', 'Brevity', 'Formflow', 'Launchkit', 'Crona',
];

function StartupMarquee() {
  const [names, setNames] = useState<string[]>(fallbackNames);

  useEffect(() => {
    fetchLeaderboard()
      .then((lb) => {
        if (lb.length > 0) setNames(lb.map((l) => l.name));
      })
      .catch(() => {});
  }, []);

  const items = [...names, ...names];
  return (
    <div className="mask-fade-x overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-3">
        {items.map((name, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border border-border-c bg-surface-2 px-4 py-2 text-sm text-text-muted"
          >
            <span className="h-4 w-4 rounded bg-gradient-to-br from-brand-400/60 to-brand-600/60" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="section relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Three steps. <span className="gradient-text">Zero friction.</span>
            </>
          }
          subtitle="Embed once, get promoted forever. The network handles the rest."
        />

        <div className="mt-16 space-y-24">
          {steps.map((step, i) => (
            <StepRow key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepRow({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useReveal<HTMLDivElement>();
  const reversed = index % 2 === 1;
  const spotlight = useSpotlight();
  return (
    <div
      ref={ref}
      className={`reveal grid items-center gap-10 lg:grid-cols-2 ${
        reversed ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div>
        <span className="font-mono text-sm font-semibold text-brand-500 dark:text-brand-400">
          STEP {step.num}
        </span>
        <h3 className="h-display mt-3 text-2xl text-text sm:text-3xl text-balance">
          {step.title}
        </h3>
        <ul className="mt-6 space-y-3">
          {step.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-text-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500 dark:text-brand-400" />
              <span>{p.replace(/^✓\s*/, '')}</span>
            </li>
          ))}
        </ul>
      </div>

      <div {...spotlight} className="spotlight">
        {step.visual === 'promote' && <PromoteVisual />}
        {step.visual === 'code' && <CodeVisual />}
        {step.visual === 'analytics' && <AnalyticsVisual />}
      </div>
    </div>
  );
}

function PromoteVisual() {
  return (
    <div className="card-hover overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border-c bg-surface-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-text-subtle">yoursite.com</span>
      </div>
      <LoadbarDemo variant="plain" />
      <div className="grid-bg flex h-44 items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 rounded-lg bg-surface-3" />
          <div className="mx-auto h-2.5 w-36 rounded bg-surface-3" />
          <div className="mx-auto mt-2 h-2.5 w-24 rounded bg-surface-3" />
        </div>
      </div>
    </div>
  );
}

function CodeVisual() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div className="card-hover overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-c bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-text-subtle" />
          <span className="text-xs text-text-muted">index.html</span>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-c bg-surface-3 px-2.5 py-1 text-xs text-text-muted transition-colors hover:text-text"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[var(--c-code-bg)] p-5 font-mono text-[13px] leading-relaxed">
        <code className="text-text-muted">
          <span className="text-text-subtle">{`<!-- paste anywhere on your site -->\n`}</span>
          <span className="text-accent-500 dark:text-accent-400">{'<script'}</span>
          {'\n  '}
          <span className="text-brand-600 dark:text-brand-300">src</span>=
          <span className="text-amber-600 dark:text-amber-300">"https://loadbar.co/widget/loader.js"</span>
          {'\n  '}
          <span className="text-brand-600 dark:text-brand-300">data-startup-id</span>=
          <span className="text-amber-600 dark:text-amber-300">"YOUR_ID"</span>
          {'\n'}
          <span className="text-accent-500 dark:text-accent-400">{'></script>'}</span>
        </code>
      </pre>
      <div className="border-t border-border-c px-5 py-3">
        <p className="inline-flex items-center gap-2 text-xs text-text-subtle">
          <Zap className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" /> Async · zero page-speed impact
        </p>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const startRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  useEffect(() => {
    const el = startRef.current;
    if (!el) return;
    const o = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setStart(true)),
      { threshold: 0.3 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const impressions = useCountUp(48230, 1600, start);
  const clicks = useCountUp(1924, 1600, start);
  const ctr = ((clicks / Math.max(impressions, 1)) * 100).toFixed(1);

  const bars = [38, 52, 44, 68, 72, 58, 84, 76, 92, 88, 96, 100];

  return (
    <div ref={startRef} className="card-hover p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-subtle">Today</p>
          <p className="font-display text-2xl font-semibold text-text">Traffic overview</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
          <TrendingUp className="h-3.5 w-3.5" /> +24%
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Impressions" value={impressions.toLocaleString()} />
        <Stat label="Clicks" value={clicks.toLocaleString()} />
        <Stat label="CTR" value={`${ctr}%`} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-text-subtle">Impressions · last 12 hours</p>
        <div className="flex h-28 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-brand-600/40 to-brand-400 transition-all"
              style={{
                height: start ? `${h}%` : '0%',
                transitionDelay: `${i * 60}ms`,
                transitionDuration: '700ms',
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['US United States', 'GB United Kingdom', 'DE Germany', 'IN India'].map((c) => (
          <span
            key={c}
            className="rounded-lg border border-border-c bg-surface-2 px-2.5 py-1.5 text-xs text-text-muted"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-c bg-surface-2 p-3">
      <p className="text-xs text-text-subtle">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-text tabular-nums">{value}</p>
    </div>
  );
}

function LiveNetwork() {
  return (
    <section id="network" className="section relative overflow-hidden">
      <div className="glow-orb left-1/4 top-20 h-72 w-72 bg-brand-500/20 animate-glow" />
      <div className="container-px">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              center={false}
              eyebrow="Live network"
              title={
                <>
                  Track where your visitors
                  <br />
                  <span className="gradient-text">come from. In real time.</span>
                </>
              }
              subtitle="Every founder in the network shares their traffic. Watch the world light up as visitors discover startups like yours."
            />
            <Reveal delay={200}>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="card-hover group p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <f.icon className="h-5 w-5 text-brand-500 dark:text-brand-400 transition-transform group-hover:scale-110" />
                    <p className="mt-2.5 text-sm font-semibold text-text">{f.title}</p>
                    <p className="text-xs text-text-subtle">{f.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="relative">
              <div className="card-hover flex items-center justify-center p-8">
                <Globe />
              </div>
              <p className="mt-3 text-center text-xs text-text-subtle">Live network visualization</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WhyItWorks({ onCta }: { onCta: () => void }) {
  const stats = [
    {
      value: '$0',
      label: 'forever',
      desc: 'No ad budget, no CPMs, no subscriptions. You trade a 36px bar — nothing else.',
    },
    {
      value: '100%',
      label: 'founder audience',
      desc: 'Every site in the network is run by a founder. You reach people who actually buy SaaS.',
    },
    {
      value: '1 line',
      label: 'of code',
      desc: 'No SDK, no onboarding flow, no dashboard to manage. Paste once and forget.',
    },
  ];
  return (
    <section className="section relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why it works"
          title={
            <>
              The fairest growth channel
              <br />
              <span className="gradient-text">you'll ever ship.</span>
            </>
          }
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div className="card-hover group h-full p-8">
                <p className="h-display text-5xl font-semibold text-text sm:text-6xl transition-transform group-hover:scale-105 origin-left">
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-brand-500 dark:text-brand-400">
                  {s.label}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14">
          <Leaderboard />
        </div>

        <Reveal delay={120}>
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <h3 className="h-display text-2xl text-text sm:text-3xl">Start getting discovered</h3>
            <p className="max-w-md text-text-muted">
              Two minutes to set up. Free forever. Cancel by deleting one line of code.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={onCta} className="btn-primary btn-shine px-6 py-3 text-base">
                Apply your startup <ArrowUpRight className="h-4 w-4" />
              </button>
              <button onClick={onCta} className="btn-ghost px-6 py-3 text-base">
                View your dashboard
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Leaderboard() {
  const ref = useReveal<HTMLDivElement>();
  const [leaders, setLeaders] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    fetchLeaderboard()
      .then(setLeaders)
      .catch(() => setLeaders([]));
  }, []);

  return (
    <div ref={ref} id="leaderboard" className="reveal card-hover overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-brand-500 dark:text-brand-400" />
          <h3 className="font-display text-lg font-semibold text-text">Network leaderboard</h3>
        </div>
        <span className="text-xs text-text-subtle">Ranked by impressions (7 days)</span>
      </div>
      {leaders === null ? (
        <div className="divide-y divide-border-c">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <div className="h-7 w-7 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
              <div className="h-8 w-8 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
                <div className="h-3 w-20 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
              </div>
              <div className="h-4 w-12 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
              <div className="h-4 w-12 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-text-subtle">
          No startups in the network yet. Be the first to join!
        </div>
      ) : (
        <div className="divide-y divide-border-c">
          {leaders.slice(0, 10).map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-surface-3"
            >
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
              <div className="flex min-w-0 flex-1 items-center gap-3">
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
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-text tabular-nums">
                  {l.impressions.toLocaleString()}
                </p>
                <p className="text-xs text-text-subtle">impressions</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text tabular-nums">
                  {l.clicks.toLocaleString()}
                </p>
                <p className="text-xs text-text-subtle">clicks</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FinalCta({ onCta }: { onCta: () => void }) {
  return (
    <section id="support" className="section relative overflow-hidden">
      <div className="container-px">
        <Reveal>
          <div className="mesh-bg relative overflow-hidden rounded-3xl border border-border-strong p-10 text-center sm:p-16">
            <div className="glow-orb left-1/2 top-0 h-60 w-60 -translate-x-1/2 bg-brand-500/30 animate-glow" />
            <div className="absolute inset-0 dot-bg opacity-40" />
            <div className="relative">
              <span className="eyebrow mx-auto">
                <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" /> Join 2,000+ founders
              </span>
              <h2 className="h-display mx-auto mt-5 max-w-2xl text-3xl text-text sm:text-5xl text-balance">
                Your first real visitors are
                <br />
                <span className="gradient-text-animate">one line of code away.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-text-muted">
                No budget. No gatekeeping. Just founders trading a little screen real estate for
                real reach.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button onClick={onCta} className="btn-primary btn-shine px-7 py-3.5 text-base">
                  Add your startup — free <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-ghost px-7 py-3.5 text-base"
                >
                  Read the docs
                </button>
              </div>
              <p className="mt-6 text-xs text-text-subtle">
                Free forever · No credit card · Cancel by deleting one line of code
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
