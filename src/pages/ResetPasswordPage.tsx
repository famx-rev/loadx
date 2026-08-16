import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { FormState, SubmitButton } from '@/components/FormState';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useRouter } from '@/lib/router';

export function ResetPasswordPage({ token }: { token?: string }) {
  const { resetPassword } = useAuth();
  const { navigate } = useRouter();
  const [resetToken, setResetToken] = useState(token ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!resetToken.trim()) {
      setError('Paste the reset token from your email.');
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken.trim(), password);
      setSuccess('Password updated. You can now sign in with your new password.');
      setPassword('');
      setResetToken('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the reset token from your email and choose a new password."
      footer={
        <>
          Ready to sign in?{' '}
          <button onClick={() => navigate('/login')} className="font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300">
            Go to sign in
          </button>
        </>
      }
    >
      <FormState error={error} success={success} loading={loading}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="token">Reset token</label>
            <input
              id="token"
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="reset-token"
              className="input font-mono text-xs"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">New password</label>
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
          <SubmitButton loading={loading}>Update password</SubmitButton>
        </form>
      </FormState>
    </AuthLayout>
  );
}
