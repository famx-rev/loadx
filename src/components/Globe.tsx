import { useEffect, useMemo, useRef, useState } from 'react';

interface Visitor {
  id: number;
  lat: number;
  lng: number;
  toLat: number;
  toLng: number;
  progress: number;
  country: string;
  city: string;
  flag: string;
  device: string;
  referrer: string;
  age: number;
}

const CITIES: { city: string; country: string; flag: string; lat: number; lng: number }[] = [
  { city: 'San Francisco', country: 'United States', flag: 'US', lat: 37.77, lng: -122.42 },
  { city: 'New York', country: 'United States', flag: 'US', lat: 40.71, lng: -74.0 },
  { city: 'Austin', country: 'United States', flag: 'US', lat: 30.27, lng: -97.74 },
  { city: 'London', country: 'United Kingdom', flag: 'GB', lat: 51.51, lng: -0.13 },
  { city: 'Berlin', country: 'Germany', flag: 'DE', lat: 52.52, lng: 13.4 },
  { city: 'Lisbon', country: 'Portugal', flag: 'PT', lat: 38.72, lng: -9.14 },
  { city: 'Amsterdam', country: 'Netherlands', flag: 'NL', lat: 52.37, lng: 4.9 },
  { city: 'Stockholm', country: 'Sweden', flag: 'SE', lat: 59.33, lng: 18.06 },
  { city: 'Warsaw', country: 'Poland', flag: 'PL', lat: 52.23, lng: 21.01 },
  { city: 'Lagos', country: 'Nigeria', flag: 'NG', lat: 6.52, lng: 3.38 },
  { city: 'Cape Town', country: 'South Africa', flag: 'ZA', lat: -33.92, lng: 18.42 },
  { city: 'Nairobi', country: 'Kenya', flag: 'KE', lat: -1.29, lng: 36.82 },
  { city: 'Dubai', country: 'UAE', flag: 'AE', lat: 25.2, lng: 55.27 },
  { city: 'Bangalore', country: 'India', flag: 'IN', lat: 12.97, lng: 77.59 },
  { city: 'Mumbai', country: 'India', flag: 'IN', lat: 19.07, lng: 72.88 },
  { city: 'Singapore', country: 'Singapore', flag: 'SG', lat: 1.35, lng: 103.82 },
  { city: 'Tokyo', country: 'Japan', flag: 'JP', lat: 35.68, lng: 139.69 },
  { city: 'Seoul', country: 'South Korea', flag: 'KR', lat: 37.57, lng: 126.98 },
  { city: 'Sydney', country: 'Australia', flag: 'AU', lat: -33.87, lng: 151.21 },
  { city: 'Melbourne', country: 'Australia', flag: 'AU', lat: -37.81, lng: 144.96 },
  { city: 'São Paulo', country: 'Brazil', flag: 'BR', lat: -23.55, lng: -46.63 },
  { city: 'Mexico City', country: 'Mexico', flag: 'MX', lat: 19.43, lng: -99.13 },
  { city: 'Buenos Aires', country: 'Argentina', flag: 'AR', lat: -34.6, lng: -58.38 },
  { city: 'Toronto', country: 'Canada', flag: 'CA', lat: 43.65, lng: -79.38 },
];

const DEVICES = ['Desktop', 'Mobile', 'Tablet'];
const REFERRERS = ['Google', 'Twitter / X', 'Direct', 'Product Hunt', 'Reddit', 'Hacker News', 'LinkedIn'];

const SIZE = 520;
const R = 210;

function project(lat: number, lng: number) {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const x = R * Math.cos(phi) * Math.sin(lambda);
  const y = -R * Math.sin(phi);
  const z = R * Math.cos(phi) * Math.cos(lambda);
  const rotY = (window.__loadbarGlobeRot ?? 0) * (Math.PI / 180);
  const xr = x * Math.cos(rotY) + z * Math.sin(rotY);
  const zr = -x * Math.sin(rotY) + z * Math.cos(rotY);
  return { x: SIZE / 2 + xr, y: SIZE / 2 + y, z: zr };
}

declare global {
  interface Window {
    __loadbarGlobeRot?: number;
  }
}

function dotGrid() {
  const dots: { x: number; y: number; z: number; mag: number }[] = [];
  const step = 14;
  for (let lat = -78; lat <= 78; lat += step) {
    const circumference = 360 * Math.cos((lat * Math.PI) / 180);
    const lngStep = Math.max(step, circumference / 24);
    for (let lng = -180; lng < 180; lng += lngStep) {
      const p = project(lat, lng + (lat / 78) * 6);
      dots.push({ ...p, mag: p.z / R });
    }
  }
  return dots;
}

function arcPoint(from: Visitor, t: number) {
  const p1 = project(from.lat, from.lng);
  const p2 = project(from.toLat, from.toLng);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2 - 70;
  const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midX + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midY + t * t * p2.y;
  return { x, y };
}

let visitorSeq = 0;
function makeVisitor(): Visitor {
  const from = CITIES[Math.floor(Math.random() * CITIES.length)];
  let to = CITIES[Math.floor(Math.random() * CITIES.length)];
  while (to.city === from.city) to = CITIES[Math.floor(Math.random() * CITIES.length)];
  return {
    id: visitorSeq++,
    lat: from.lat,
    lng: from.lng,
    toLat: to.lat,
    toLng: to.lng,
    progress: 0,
    country: from.country,
    city: from.city,
    flag: from.flag,
    device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
    referrer: REFERRERS[Math.floor(Math.random() * REFERRERS.length)],
    age: 0,
  };
}

export function Globe() {
  const [rotation, setRotation] = useState(0);
  const [visitors, setVisitors] = useState<Visitor[]>(() =>
    Array.from({ length: 4 }, makeVisitor),
  );
  const [count, setCount] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    window.__loadbarGlobeRot = rotation;
  }, [rotation]);

  const dots = useMemo(() => dotGrid(), []);

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setRotation((r) => (r + dt * 0.012) % 360);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const spawn = setInterval(() => {
      setVisitors((prev) => {
        const next = [...prev];
        if (next.length < 7 && Math.random() > 0.4) next.push(makeVisitor());
        return next;
      });
      setCount((c) => c + 1);
    }, 1400);
    return () => clearInterval(spawn);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setVisitors((prev) =>
        prev
          .map((v) => ({ ...v, progress: v.progress + 0.012, age: v.age + 1 }))
          .filter((v) => v.progress < 1.05)
          .slice(-7),
      );
    }, 30);
    return () => clearInterval(tick);
  }, []);

  const projectedDots = dots.map((d) => {
    const p = project(
      (d.y - SIZE / 2) / -R * (180 / Math.PI),
      Math.atan2(d.x - SIZE / 2, d.z) * (180 / Math.PI),
    );
    return { x: p.x, y: p.y, z: p.z, mag: p.z / R };
  });

  const todayCount = 2400 + count;

  const activeVisitors = visitors
    .filter((v) => v.progress < 1)
    .slice(-3)
    .reverse();
  const recentSlots: (Visitor | null)[] = [0, 1, 2].map((i) => activeVisitors[i] ?? null);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE, maxWidth: '100%' }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, rgba(23,189,132,0.18), transparent 55%), radial-gradient(circle at 70% 75%, rgba(251,92,18,0.12), transparent 50%)',
          }}
        />
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="relative h-full w-full"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
        >
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--c-border)" />

          {projectedDots.map((d, i) => {
            const visible = d.z > -R * 0.2;
            const opacity = visible ? Math.max(0.06, (d.z + R * 0.2) / (R * 1.2)) : 0;
            return (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={1.1}
                fill={d.z > 0 ? 'var(--c-globe-dots-front)' : 'var(--c-globe-dots-back)'}
                opacity={opacity}
              />
            );
          })}

          {visitors.map((v) => {
            const from = project(v.lat, v.lng);
            const to = project(v.toLat, v.toLng);
            if (from.z < -R * 0.3 && to.z < -R * 0.3) return null;
            const head = arcPoint(v, v.progress);
            const visible = v.progress < 1;
            return (
              <g key={v.id}>
                {visible && (
                  <>
                    <path
                      d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${
                        (from.y + to.y) / 2 - 70
                      } ${head.x} ${head.y}`}
                      fill="none"
                      stroke="url(#arcGrad)"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      opacity={Math.min(1, v.progress * 2)}
                    />
                    <circle cx={head.x} cy={head.y} r={2.6} fill="#fb5c12">
                      <animate
                        attributeName="r"
                        values="2.6;4;2.6"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
                {from.z > -R * 0.2 && (
                  <circle cx={from.x} cy={from.y} r={2.5} fill="#3dd79e" opacity={0.9}>
                    <animate
                      attributeName="r"
                      values="2.5;4;2.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {v.progress >= 1 && to.z > -R * 0.2 && (
                  <circle cx={to.x} cy={to.y} r={6} fill="none" stroke="#fb5c12" strokeWidth={1.5}>
                    <animate
                      attributeName="r"
                      values="3;12;3"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9;0;0.9"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3dd79e" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fb5c12" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-glow" />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1">
        <p className="font-display text-3xl font-semibold text-text tabular-nums">
          {todayCount.toLocaleString()} <span className="text-text-muted text-base font-normal">visitors today</span>
        </p>
        <p className="text-sm text-text-subtle">Across the Loadbar network in real time</p>
      </div>

      <div className="mt-6 w-full max-w-md">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-text-subtle">
          Recent visitors
        </p>
        <div className="space-y-2" style={{ height: '158px', overflow: 'hidden' }}>
          {recentSlots.map((v, i) =>
            v ? (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-lg border border-border-c bg-surface-2 px-3 py-2 animate-slide-left"
                style={{ height: '46px' }}
              >
                <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-surface-3 text-[10px] font-semibold text-text-muted">
                  {v.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text">
                    {v.city}, {v.country}
                  </p>
                  <p className="text-[11px] text-text-subtle">
                    via {v.referrer} · {v.device}
                  </p>
                </div>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-glow" />
              </div>
            ) : (
              <div key={`empty-${i}`} style={{ height: '46px' }} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
