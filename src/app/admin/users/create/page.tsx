import AdminLayout from '../../../../components/admin/AdminLayout';
import { CreateUserForm } from '../../../../components/admin/CreateUserForm';

export default function AdminCreateUserPage() {
  return (
    <AdminLayout>
      <div className="w-full max-w-none">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buat user
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tambah akun karyawan baru. Role akan di-set ke <span className="font-semibold">USER</span>; field wajib
            mengikuti validasi backend (termasuk branch & position).
          </p>
        </div>
        <CreateUserForm />
      </div>
    </AdminLayout>
  );
}
