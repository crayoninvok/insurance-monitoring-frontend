'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { AdminShell } from '../../components/admin/AdminShell';

export default function AdminAppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="min-h-dvh bg-zinc-50 dark:bg-black">
        <AdminShell>{children}</AdminShell>
      </div>
    </AuthGuard>
  );
}
