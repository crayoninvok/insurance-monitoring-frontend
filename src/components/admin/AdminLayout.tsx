import type { ReactNode } from 'react';
import { AdminShell } from './AdminShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
