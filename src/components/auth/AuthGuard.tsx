'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken } from '../../services/api';

type AppRole = 'ADMIN' | 'USER';

function getRoleFromToken(token: string): AppRole | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const parsed = JSON.parse(json) as { role?: unknown };

    if (parsed.role === 'ADMIN') return 'ADMIN';
    if (parsed.role === 'USER') return 'USER';
    return null;
  } catch {
    return null;
  }
}

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: AppRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  const token = useMemo(() => getAuthToken(), []);

  useEffect(() => {
    if (!token) {
      router.replace('/');
      return;
    }

    if (requiredRole) {
      const role = getRoleFromToken(token);
      if (role !== requiredRole) {
        router.replace('/');
        return;
      }
    }

    setIsAllowed(true);
  }, [pathname, requiredRole, router, token]);

  if (!isAllowed) return null;
  return <>{children}</>;
}
