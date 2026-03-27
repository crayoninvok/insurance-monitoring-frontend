'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '../../services/auth.services';
import { AlertDialog } from '../ui/AlertDialog';

type UserSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
};

function NavItem({
  href,
  label,
  active,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  active?: boolean;
  icon: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition',
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900/50',
      ].join(' ')}
    >
      <span className={active ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default function UserSidebar({
  className,
  onNavigate,
  showCloseButton,
  onClose,
}: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <aside
      className={[
        'flex min-h-dvh shrink-0 flex-col border-r border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-black/40',
        className ?? '',
      ].join(' ')}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-5">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logobdp.png"
                alt="Logo"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                User
              </span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Budget Insurance
              </span>
            </div>
          </div>

          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 lg:hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              aria-label="Close sidebar"
            >
              Close
            </button>
          ) : null}
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1">
          <NavItem
            href="/budget"
            label="My Budget"
            active={pathname === '/budget'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1v22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <NavItem
            href="/profile"
            label="Profile"
            active={pathname === '/profile'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
        </nav>

        <div className="mt-auto shrink-0 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Quick actions
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              className="mt-3 w-full rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <AlertDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Logout dari akun?"
        description="Sesi Anda akan diakhiri. Anda bisa login lagi kapan saja."
        cancelLabel="Batal"
        actionLabel="Ya, logout"
        actionVariant="danger"
        onAction={() => {
          logout();
          router.replace('/login');
        }}
      />
    </aside>
  );
}
