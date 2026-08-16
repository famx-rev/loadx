export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg bg-surface-3 ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonNav() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border-c px-5 sm:px-8 lg:px-10">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="hidden items-center gap-4 lg:flex">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="mt-4 h-7 w-20" />
      <Skeleton className="mt-2 h-4 w-16" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 260 }: { height?: number }) {
  return (
    <div className="card p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-1 h-3 w-24" />
      <div className="mt-6 flex items-end gap-2" style={{ height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${20 + ((i * 37) % 60)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="divide-y divide-border-c">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
