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
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

function NavItem({
  href,
  label,
  active,
  icon,
  onNavigate,
  collapsed,
}: {
  href: string;
  label: string;
  active?: boolean;
  icon: React.ReactNode;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={[
        'flex items-center rounded-2xl py-2 text-sm font-semibold transition',
        collapsed
          ? 'gap-3 px-3 max-lg:justify-start lg:justify-center lg:gap-0 lg:px-2'
          : 'gap-3 px-3',
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900/50',
      ].join(' ')}
    >
      <span className={`shrink-0 ${active ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
        {icon}
      </span>
      <span className={collapsed ? 'truncate lg:sr-only' : 'truncate'}>{label}</span>
    </Link>
  );
}

function IconChevronSidebar({ direction }: { direction: 'in' | 'out' }) {
  const isIn = direction === 'in';
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={isIn ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UserSidebar({
  className,
  onNavigate,
  showCloseButton,
  onClose,
  collapsed = false,
  onToggleCollapsed,
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
      <div className={`flex min-h-0 flex-1 flex-col gap-6 ${collapsed ? 'p-3 lg:p-2' : 'p-5'}`}>
        <div
          className={[
            'flex shrink-0 items-center gap-3',
            collapsed ? 'justify-between max-lg:justify-between lg:flex-col lg:justify-center' : 'justify-between',
          ].join(' ')}
        >
          <div
            className={[
              'flex items-center gap-3',
              collapsed ? 'max-lg:flex-row lg:flex-col lg:items-center lg:gap-2' : '',
            ].join(' ')}
          >
            <div
              className={[
                'relative shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
                collapsed ? 'h-10 w-10 lg:h-9 lg:w-9' : 'h-10 w-10',
              ].join(' ')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logobdp.png"
                alt="Logo"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div
              className={
                collapsed
                  ? 'flex min-w-0 flex-col max-lg:flex lg:hidden'
                  : 'flex min-w-0 flex-col'
              }
            >
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
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M12 11h.01M16 11h.01M8 11h.01M12 15h.01M16 15h.01M8 15h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            }
          />
          <NavItem
            href="/profile"
            label="Profile"
            active={pathname === '/profile'}
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
        </nav>

        <div className="mt-auto shrink-0 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {onToggleCollapsed ? (
            <div className="mb-3 hidden justify-center lg:flex">
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
                title={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
              >
                <IconChevronSidebar direction={collapsed ? 'out' : 'in'} />
              </button>
            </div>
          ) : null}

          <div
            className={[
              'rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40',
              collapsed ? 'p-2 lg:p-2' : 'p-4',
            ].join(' ')}
          >
            <div
              className={
                collapsed
                  ? 'hidden max-lg:block text-xs font-semibold text-zinc-500 dark:text-zinc-400'
                  : 'text-xs font-semibold text-zinc-500 dark:text-zinc-400'
              }
            >
              Quick actions
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              title="Logout"
              className={[
                'w-full rounded-2xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200',
                collapsed
                  ? 'mt-3 flex items-center justify-center px-3 py-2 max-lg:mt-3 lg:mt-0 lg:px-2 lg:py-2.5'
                  : 'mt-3 px-3 py-2',
              ].join(' ')}
            >
              {collapsed ? (
                <span className="hidden max-lg:inline">Logout</span>
              ) : (
                'Logout'
              )}
              {collapsed ? (
                <span className="hidden lg:inline-flex" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
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
