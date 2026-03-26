import AdminLayout from '../../../components/admin/AdminLayout';
import { ProfileCard } from '../../../components/shared/ProfileCard';

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Profile
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Kelola data profile akun Anda.
          </p>
        </div>
        <ProfileCard />
      </div>
    </AdminLayout>
  );
}

