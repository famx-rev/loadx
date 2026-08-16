import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { FormState, SubmitButton } from '@/components/FormState';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useRouter } from '@/lib/router';

export function SignupPage() {
  const { signup } = useAuth();
  const { navigate } = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Choose a username.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password, username.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the network"
      subtitle="Add your startup and start getting discovered by other founders. Free forever."
      footer={
        <>
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300">
            Sign in
          </button>
        </>
      }
    >
      <FormState error={error} loading={loading}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="input"
            />
          </div>
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
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
          <SubmitButton loading={loading}>Create my account</SubmitButton>
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
