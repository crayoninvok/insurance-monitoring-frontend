'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  adminDeleteUser,
  adminListUsers,
  adminUpdateUser,
} from '../../services/auth.services';
import type { Branch, Department, Gender, Position, Role, Status, UserProfile } from '../../types/types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { formatBranchLabel } from '../../constants/branchLabels';
import { formatPositionLabel } from '../../constants/positionLabels';

const DEPARTMENTS: Department[] = [
  'HRGA',
  'FINANCE',
  'PROCUREMENT',
  'OPERATIONS',
  'PLANT',
  'INFRASTRUCTURE',
  'LOGISTICS',
  'TRAINING_CENTER',
  'MANAGEMENT',
];
const BRANCHES: Branch[] = ['HEAD_OFFICE', 'SENYIUR', 'MUARA_PAHU'];
const POSITIONS: Position[] = [
  'DIRECTOR',
  'MANAGER',
  'SUPERINTENDENT',
  'SUPERVISOR',
  'JUNIOR_SUPERVISOR',
  'WORKER',
];
const selectClass =
  'h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600';

export function AdminUsersManager() {
  const [rows, setRows] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListUsers({ q: search, page, pageSize });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setRows(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      void load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function onDelete(userId: string) {
    const ok = window.confirm('Yakin ingin menghapus user ini?');
    if (!ok) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await adminDeleteUser(userId);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setSuccess('User berhasil dihapus');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus user');
    }
  }

  const stats = useMemo(() => {
    const active = rows.filter((x) => x.status === 'ACTIVE').length;
    return { active };
  }, [rows]);

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await adminUpdateUser(editUser.id, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        phone: editUser.phone,
        email: editUser.email,
        gender: editUser.gender as Gender,
        department: editUser.department as Department,
        branch: editUser.branch as Branch,
        position: editUser.position as Position,
        status: editUser.status as Status,
        role: editUser.role as Role,
      });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setSuccess('Data user berhasil diupdate');
      setEditUser(null);
      await load();
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Gagal update user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <Alert title="Error" message={error} /> : null}
      {success ? <Alert title="Berhasil" message={success} variant="success" /> : null}

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-end dark:border-zinc-800 dark:bg-zinc-950">
        <TextField
          label="Search User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nama, email, telepon"
          disabled={loading}
        />
        <div className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          Total: <span className="font-semibold">{total}</span>
        </div>
        <div className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          Active (halaman): <span className="font-semibold">{stats.active}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-[1080px] w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">Kontak</th>
              <th className="px-3 py-2 text-left">Departemen</th>
              <th className="px-3 py-2 text-left">Branch</th>
              <th className="px-3 py-2 text-left">Position</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-3 py-2">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.firstName} {r.lastName}
                  </div>
                  <div className="text-xs text-zinc-500">{r.role}</div>
                </td>
                <td className="px-3 py-2">
                  <div>{r.email}</div>
                  <div className="text-xs text-zinc-500">{r.phone}</div>
                </td>
                <td className="px-3 py-2">{r.department}</td>
                <td className="px-3 py-2">{formatBranchLabel(r.branch)}</td>
                <td className="px-3 py-2">{formatPositionLabel(r.position)}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => setEditUser(r)}>
                      Edit
                    </Button>
                    <Button className="h-8 px-3 text-xs" onClick={() => void onDelete(r.id)}>
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading ? (
              <tr>
                <td className="px-3 py-4 text-center text-zinc-500" colSpan={7}>
                  Tidak ada data user.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {total > pageSize ? (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Page {page} / {totalPages} ({total} users)
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="h-8 px-3 text-xs"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              className="h-8 px-3 text-xs"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {editUser ? (
        <form
          onSubmit={(e) => void onSaveEdit(e)}
          className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="md:col-span-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Edit User
          </div>
          <TextField label="Nama depan" value={editUser.firstName} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, firstName: e.target.value } : prev))} />
          <TextField label="Nama belakang" value={editUser.lastName} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, lastName: e.target.value } : prev))} />
          <TextField label="Email" type="email" value={editUser.email} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, email: e.target.value } : prev))} />
          <TextField label="Telepon" value={editUser.phone} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, phone: e.target.value } : prev))} />
          <div>
            <label className="mb-1 block text-sm font-medium">Gender</label>
            <select className={selectClass} value={editUser.gender} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, gender: e.target.value as Gender } : prev))}>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select className={selectClass} value={editUser.status} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, status: e.target.value as Status } : prev))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <select className={selectClass} value={editUser.role} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, role: e.target.value as Role } : prev))}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Department</label>
            <select className={selectClass} value={editUser.department} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, department: e.target.value as Department } : prev))}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Branch</label>
            <select className={selectClass} value={editUser.branch} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, branch: e.target.value as Branch } : prev))}>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Position</label>
            <select className={selectClass} value={editUser.position} onChange={(e) => setEditUser((prev) => (prev ? { ...prev, position: e.target.value as Position } : prev))}>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={saving} className="h-10 min-w-[120px]">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button type="button" variant="secondary" className="h-10" onClick={() => setEditUser(null)}>
              Batal
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

