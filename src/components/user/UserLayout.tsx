'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '../auth/AuthGuard';
import { UserShell } from './UserShell';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="USER">
      <div className="min-h-dvh bg-zinc-50 dark:bg-black">
        <UserShell>{children}</UserShell>
      </div>
    </AuthGuard>
  );
}
