import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { matchRoute, useRouter } from '@/lib/router';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SkeletonNav } from '@/components/Skeleton';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { OnboardPage } from '@/pages/OnboardPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { NetworkPage } from '@/pages/NetworkPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen">
      <SkeletonNav />
      <div className="container-px py-10">
        <div className="space-y-4">
          <div className="h-8 w-64 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
          <div className="h-4 w-96 max-w-full rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-9 w-9 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
              <div className="mt-4 h-7 w-20 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
              <div className="mt-2 h-4 w-16 rounded-lg bg-surface-3" style={{ background: 'linear-gradient(90deg, var(--c-surface-3) 25%, var(--c-border) 50%, var(--c-surface-3) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login');
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-text-muted">Redirecting to sign in…</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to sign in
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function Routes() {
  const { route } = useRouter();
  const path = route.path;

  const resetParams = matchRoute(path, '/reset/:token');
  if (resetParams) {
    return <ResetPasswordPage token={resetParams.token} />;
  }

  const projectParams = matchRoute(path, '/p/:id');
  if (projectParams) {
    return <ProjectDetailPage id={projectParams.id} />;
  }

  const dashboardParams = matchRoute(path, '/dashboard/:startupId');
  if (dashboardParams) {
    return (
      <ProtectedRoute>
        <DashboardPage startupId={dashboardParams.startupId} />
      </ProtectedRoute>
    );
  }

  switch (path) {
    case '/':
      return <LandingPage />;
    case '/network':
      return <NetworkPage />;
    case '/login':
      return <LoginPage />;
    case '/join':
      return <SignupPage />;
    case '/forgot':
      return <ForgotPasswordPage />;
    case '/dashboard':
      return (
        <ProtectedRoute>
          <OnboardPage />
        </ProtectedRoute>
      );
    default:
      return <NotFound />;
  }
}

function NotFound() {
  const { navigate } = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-display text-7xl font-semibold text-text">404</p>
      <p className="text-text-muted">This page wandered off the network.</p>
      <button onClick={() => navigate('/')} className="btn-primary">
        Back home
      </button>
    </div>
  );
}

function Shell() {
  const { route } = useRouter();
  const path = route.path;
  const isAuthPage =
    path === '/login' || path === '/join' || path === '/forgot' || path.startsWith('/reset');
  const isDashboard = path === '/dashboard' || path.startsWith('/dashboard/');
  const isProjectPage = path.startsWith('/p/');

  return (
    <div className="min-h-screen">
      {!isAuthPage && <Nav />}
      <Routes />
      {!isAuthPage && !isDashboard && !isProjectPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}
