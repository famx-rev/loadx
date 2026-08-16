import { useCallback, useEffect, useState } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart || '/';
  const query = new URLSearchParams(queryPart || '');
  return { path, params: {}, query };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const target = to.startsWith('#') ? to : `#${to}`;
    if (window.location.hash === target) {
      setRoute(parseHash());
    } else {
      window.location.hash = target;
    }
  }, []);

  return { route, navigate };
}

export function matchRoute(
  path: string,
  pattern: string,
): Record<string, string> | null {
  const pp = pattern.split('/').filter(Boolean);
  const pa = path.split('/').filter(Boolean);
  if (pp.length !== pa.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) {
      params[pp[i].slice(1)] = decodeURIComponent(pa[i]);
    } else if (pp[i] !== pa[i]) {
      return null;
    }
  }
  return params;
}
