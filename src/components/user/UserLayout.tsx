import type { ReactNode } from 'react';
import { UserShell } from './UserShell';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <UserShell>{children}</UserShell>
    </div>
  );
}
