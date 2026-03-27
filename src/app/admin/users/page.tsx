import { AdminUsersManager } from '../../../components/admin/AdminUsersManager';

export default function AdminUsersPage() {
  return (
    <div className="w-full max-w-none">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          User Management
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Kelola data user: cari, edit, dan hapus (soft delete).
        </p>
      </div>
      <AdminUsersManager />
    </div>
  );
}

