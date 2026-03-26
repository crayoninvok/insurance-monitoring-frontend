'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../../services/auth.services';

type AdminSidebarProps = {
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

export default function AdminSidebar({
  className,
  onNavigate,
  showCloseButton,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
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
                Admin
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
            href="/admin/budget"
            label="Budget Policies"
            active={pathname === '/admin/budget'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 7v5l3 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <NavItem
            href="/admin/users/create"
            label="Buat User"
            active={pathname === '/admin/users/create'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 8v6M23 11h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <NavItem
            href="/admin/users"
            label="User Management"
            active={pathname === '/admin/users'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4Z" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12c2.21 0 4-2.015 4-4.5S10.21 3 8 3 4 5.015 4 7.5 5.79 12 8 12Z" stroke="currentColor" strokeWidth="2" />
                <path d="M3 20c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 20c0-2.1 1.79-3.8 4-3.8 1.03 0 1.97.37 2.68.98" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />

          <NavItem
            href="/admin/user-budgets"
            label="User Budgets"
            active={pathname === '/admin/user-budgets'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 8v6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M23 11h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <NavItem
            href="/admin/ledger"
            label="Ledger"
            active={pathname === '/admin/ledger'}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 7h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 12h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 17h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            }
          />

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
            href="/admin/profile"
            label="Profile"
            active={pathname === '/admin/profile'}
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
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="mt-3 w-full rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Logout
          </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

