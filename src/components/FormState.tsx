import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function FormState({
  error,
  success,
  loading,
  children,
}: {
  error?: string | null;
  success?: string | null;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-500 dark:text-red-300 animate-slide-down">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-brand-500/20 bg-brand-500/10 px-3.5 py-2.5 text-sm text-brand-600 dark:text-brand-200 animate-slide-down">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 px-1 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Please wait…
        </div>
      )}
      {children}
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  fullWidth = true,
}: {
  loading: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`btn-primary ${fullWidth ? 'w-full' : ''} px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
