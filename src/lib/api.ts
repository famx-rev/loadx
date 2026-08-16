const BASE =
  'https://api-eight-navy-68.vercel.app/api/authx/cb705c5d-4e34-491d-91c0-e795d7b7da10/user';

export interface AuthUser {
  id?: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function extractToken(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const obj = data as Record<string, unknown>;
  return (
    (typeof obj.token === 'string' && obj.token) ||
    (typeof obj.jwt === 'string' && obj.jwt) ||
    (typeof obj.accessToken === 'string' && obj.accessToken) ||
    (typeof obj.access_token === 'string' && obj.access_token) ||
    (typeof obj.authToken === 'string' && obj.authToken) ||
    ''
  );
}

function extractUser(data: unknown): AuthUser {
  if (!data || typeof data !== 'object') return { email: '' };
  const obj = data as Record<string, unknown>;
  const userSrc =
    (obj.user as Record<string, unknown> | undefined) ||
    (obj.data as Record<string, unknown> | undefined) ||
    (obj.profile as Record<string, unknown> | undefined) ||
    obj;
  const email =
    (typeof userSrc.email === 'string' && userSrc.email) ||
    (typeof userSrc.emailAddress === 'string' && userSrc.emailAddress) ||
    '';
  const username =
    (typeof userSrc.username === 'string' && userSrc.username) ||
    (typeof userSrc.userName === 'string' && userSrc.userName) ||
    undefined;
  const name =
    (typeof userSrc.name === 'string' && userSrc.name) ||
    (typeof userSrc.fullName === 'string' && userSrc.fullName) ||
    undefined;
  const id =
    (typeof userSrc.id === 'string' && userSrc.id) ||
    (typeof userSrc._id === 'string' && userSrc._id) ||
    (typeof userSrc.userId === 'string' && userSrc.userId) ||
    undefined;
  const avatar =
    (typeof userSrc.avatar === 'string' && userSrc.avatar) ||
    (typeof userSrc.avatarUrl === 'string' && userSrc.avatarUrl) ||
    (typeof userSrc.image === 'string' && userSrc.image) ||
    undefined;
  return { id, email, username, name, avatar };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Network error — check your connection and try again.', 0);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const raw =
      (body && typeof body === 'object' && (body as Record<string, unknown>).message) ||
      (body && typeof body === 'object' && (body as Record<string, unknown>).error) ||
      `Request failed (${res.status})`;
    throw new ApiError(
      typeof raw === 'string' ? raw : 'Something went wrong. Please try again.',
      res.status,
    );
  }

  return (body ?? ({} as T)) as T;
}

export async function signup(
  email: string,
  password: string,
  username: string,
): Promise<AuthResponse> {
  const data = await request<unknown>('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
  const token = extractToken(data);
  if (!token) throw new ApiError('Signup succeeded but no auth token was returned.', 200);
  return { token, user: extractUser(data) };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<unknown>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const token = extractToken(data);
  if (!token) throw new ApiError('Login succeeded but no auth token was returned.', 200);
  return { token, user: extractUser(data) };
}

export async function forgotPassword(email: string): Promise<void> {
  await request('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await request('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function getMe(token: string): Promise<AuthUser> {
  const data = await request<unknown>('/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return extractUser(data);
}
