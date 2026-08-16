import type { ReactNode } from 'react';
import { useReveal } from '@/lib/hooks';

export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2 className="h-display mt-5 text-3xl text-text sm:text-4xl md:text-5xl text-balance">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={140}>
          <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg text-balance">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
