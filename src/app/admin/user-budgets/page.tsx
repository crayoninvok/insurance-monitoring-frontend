import AdminLayout from '../../../components/admin/AdminLayout';
import { AdminUserBudgetsTable } from '../../../components/admin/AdminUserBudgetsTable';

export default function AdminUserBudgetsPage() {
  return (
    <AdminLayout>
      <div className="w-full max-w-none">
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Budget Control - All Users
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Admin dapat melihat allocated, spent, dan remaining untuk semua user,
              lalu menambah spend agar sesuai kebutuhan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              Admin only
            </span>
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
              Overspend blocked
            </span>
          </div>
        </div>

        <AdminUserBudgetsTable />
      </div>
    </AdminLayout>
  );
}

