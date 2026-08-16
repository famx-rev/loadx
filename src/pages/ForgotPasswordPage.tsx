import { useState } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { FormState, SubmitButton } from '@/components/FormState';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useRouter } from '@/lib/router';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError('Enter the email tied to your account.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSuccess('If an account exists for that email, a reset link is on its way.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      footer={
        <>
          Remembered it?{' '}
          <button onClick={() => navigate('/login')} className="font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300">
            Back to sign in
          </button>
        </>
      }
    >
      <FormState error={error} success={success} loading={loading}>
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
          <SubmitButton loading={loading}>Send reset link</SubmitButton>
        </form>
      </FormState>
    </AuthLayout>
  );
}
