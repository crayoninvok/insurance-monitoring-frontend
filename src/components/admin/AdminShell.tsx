'use client';

import { useEffect, useState, type ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex" style={{ minHeight: '100dvh' }}>
      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">Admin</div>
          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">Budget Insurance</div>
        </div>
      </header>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar
        className={[
          'fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] max-w-[88vw] transition-transform duration-200 ease-out lg:static lg:z-0 lg:max-w-none lg:w-[280px] lg:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        onNavigate={() => setMobileOpen(false)}
        showCloseButton
        onClose={() => setMobileOpen(false)}
      />

      <div
        className="flex min-w-0 flex-1 flex-col pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0"
        style={{ minHeight: '100dvh' }}
      >
        <div className="relative flex-1 overflow-x-hidden">
          <div className="pointer-events-none absolute -top-28 left-10 h-60 w-60 rounded-full bg-zinc-200/60 blur-3xl dark:bg-white/10" />
          <div className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full bg-zinc-200/40 blur-3xl dark:bg-white/10" />

          <div className="relative p-4 sm:p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
