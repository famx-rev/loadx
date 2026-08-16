import { EDGE_URL } from './supabase';

export interface Startup {
  id: string;
  owner_id: string;
  name: string;
  domain: string;
  tagline: string;
  url: string;
  accent_from: string;
  accent_to: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  domain: string;
  tagline: string;
  url: string;
  accent_from: string;
  accent_to: string;
  verified: boolean;
  created_at: string;
  impressions: number;
  clicks: number;
  rank: number;
}

export interface AnalyticsData {
  totals: {
    impressions: number;
    clicks: number;
    hovers: number;
    ctr: number;
  };
  daily: { day: string; impressions: number; clicks: number }[];
  topCountries: { country: string; country_code: string; count: number }[];
  deviceBreakdown: { device: string; count: number; pct: number }[];
  topReferrers: { referrer: string; count: number }[];
  activity: {
    country: string;
    country_code: string;
    city: string;
    device: string;
    referrer: string;
    created_at: string;
  }[];
}

export interface ServeResponse {
  startup: {
    id: string;
    name: string;
    domain: string;
    tagline: string;
    url: string;
    accent_from: string;
    accent_to: string;
    verified: boolean;
  };
  promotion: {
    id: string;
    name: string;
    domain: string;
    tagline: string;
    url: string;
    accent_from: string;
    accent_to: string;
    verified: boolean;
  } | null;
}

export class DataError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'DataError';
    this.status = status;
  }
}

async function edgeFetch<T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.headers) Object.assign(headers, options.headers);

  let res: Response;
  try {
    res = await fetch(`${EDGE_URL}${path}`, { ...options, headers });
  } catch {
    throw new DataError('Network error — check your connection.', 0);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && (body as Record<string, unknown>).error) ||
      `Request failed (${res.status})`;
    throw new DataError(
      typeof message === 'string' ? message : 'Something went wrong. Please try again.',
      res.status,
    );
  }

  return (body ?? {}) as T;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await edgeFetch<{ leaderboard: LeaderboardEntry[] }>('/leaderboard', null);
  return data.leaderboard ?? [];
}

export async function fetchMyStartups(token: string): Promise<Startup[]> {
  const data = await edgeFetch<{ startups: Startup[] }>('/my-startups', token);
  return data.startups ?? [];
}

export async function createStartup(
  token: string,
  profile: {
    name: string;
    domain: string;
    tagline: string;
    url: string;
    accent_from?: string;
    accent_to?: string;
  },
): Promise<Startup> {
  const data = await edgeFetch<{ startup: Startup }>('/startups', token, {
    method: 'POST',
    body: JSON.stringify(profile),
  });
  return data.startup;
}

export async function updateStartup(
  token: string,
  id: string,
  profile: {
    name: string;
    domain: string;
    tagline: string;
    url: string;
    accent_from?: string;
    accent_to?: string;
  },
): Promise<Startup> {
  const data = await edgeFetch<{ startup: Startup }>(`/startups/${encodeURIComponent(id)}`, token, {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
  return data.startup;
}

export async function deleteStartup(token: string, id: string): Promise<void> {
  await edgeFetch<{ ok: boolean }>(`/startups/${encodeURIComponent(id)}`, token, {
    method: 'DELETE',
  });
}

export async function fetchAnalytics(token: string, startupId: string): Promise<AnalyticsData | null> {
  const data = await edgeFetch<{ analytics: AnalyticsData | null }>(
    `/analytics?id=${encodeURIComponent(startupId)}`,
    token,
  );
  return data.analytics;
}

export async function fetchServe(startupId: string, exclude?: string): Promise<ServeResponse> {
  const params = new URLSearchParams({ startup_id: startupId });
  if (exclude) params.set('exclude', exclude);
  const data = await edgeFetch<ServeResponse>(`/serve?${params.toString()}`, null);
  return data;
}

export async function trackEvent(
  startupId: string,
  kind: 'impression' | 'click',
  meta?: { country?: string; country_code?: string; city?: string; device?: string; referrer?: string },
): Promise<void> {
  try {
    await edgeFetch('/track', null, {
      method: 'POST',
      body: JSON.stringify({ startup_id: startupId, kind, ...meta }),
    });
  } catch {
    // tracking is best-effort — never break the page
  }
}

export async function fetchStartupById(id: string): Promise<Startup | null> {
  try {
    const data = await edgeFetch<{ startup: Startup }>(
      `/startups/${encodeURIComponent(id)}`,
      null,
    );
    return data.startup ?? null;
  } catch (err) {
    if (err instanceof DataError && err.status === 404) return null;
    throw err;
  }
}

export interface EventRow {
  startup_id: string;
  promoted_id: string | null;
  event_data: {
    eventName?: string;
    device?: string;
    ip?: string;
    language?: string;
    promoted_id?: string;
    recordedVia?: string;
    referrer?: string;
    screenResolution?: string;
    startup_id?: string;
    timestamp?: string;
    url?: string;
    userAgent?: string;
    viewportHeight?: number;
    viewportWidth?: number;
    hovered?: boolean;
    [key: string]: unknown;
  };
}

export async function deleteAllEvents(token: string, startupId: string): Promise<void> {
  await edgeFetch<{ ok: boolean }>(`/events?id=${encodeURIComponent(startupId)}`, token, {
    method: 'DELETE',
  });
}

export async function fetchEvents(
  token: string,
  startupId: string,
  type: 'got' | 'gave' = 'got',
  limit = 100,
): Promise<EventRow[]> {
  const data = await edgeFetch<EventRow[]>(
    `/events?id=${encodeURIComponent(startupId)}&type=${type}&limit=${limit}`,
    token,
  );
  return Array.isArray(data) ? data : [];
}
