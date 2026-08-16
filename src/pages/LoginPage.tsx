import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { FormState, SubmitButton } from '@/components/FormState';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useRouter } from '@/lib/router';

export function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Loadbar dashboard."
      footer={
        <>
          New to Loadbar?{' '}
          <button onClick={() => navigate('/join')} className="font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300">
            Join the network
          </button>
        </>
      }
    >
      <FormState error={error} loading={loading}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label mb-0" htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot')}
                className="text-xs text-text-muted transition-colors hover:text-brand-500 dark:hover:text-brand-400"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <SubmitButton loading={loading}>Sign in</SubmitButton>
          <p className="text-center text-xs text-text-subtle">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-text-muted underline underline-offset-2 transition-colors hover:text-text"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-text-muted underline underline-offset-2 transition-colors hover:text-text"
            >
              Privacy Policy
            </button>
            .
          </p>
        </form>
      </FormState>
    </AuthLayout>
  );
}
