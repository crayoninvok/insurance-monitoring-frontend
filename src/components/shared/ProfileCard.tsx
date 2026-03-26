'use client';

import { useEffect, useState } from 'react';
import { getMe, updateMyProfile } from '../../services/auth.services';
import type { Gender, UserProfile } from '../../types/types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

const selectClass =
  'h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600';

export function ProfileCard() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMe();
      if (!res.success) {
        setError(res.message);
        return;
      }
      setData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateMyProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gender: data.gender as Gender,
        password: password || undefined,
      });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setData(res.data);
      setPassword('');
      setSuccess('Profile berhasil diperbarui');
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Gagal update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-950/60"
    >
      {error ? <Alert title="Error" message={error} /> : null}
      {success ? <Alert title="Berhasil" message={success} variant="success" /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Nama depan"
          value={data?.firstName ?? ''}
          disabled={loading || saving}
          onChange={(e) => setData((prev) => (prev ? { ...prev, firstName: e.target.value } : prev))}
        />
        <TextField
          label="Nama belakang"
          value={data?.lastName ?? ''}
          disabled={loading || saving}
          onChange={(e) => setData((prev) => (prev ? { ...prev, lastName: e.target.value } : prev))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Email"
          value={data?.email ?? ''}
          disabled
        />
        <TextField
          label="Telepon"
          value={data?.phone ?? ''}
          disabled={loading || saving}
          onChange={(e) => setData((prev) => (prev ? { ...prev, phone: e.target.value } : prev))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Gender</label>
          <select
            value={data?.gender ?? 'MALE'}
            disabled={loading || saving}
            onChange={(e) => setData((prev) => (prev ? { ...prev, gender: e.target.value as Gender } : prev))}
            className={selectClass}
          >
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
          </select>
        </div>
        <TextField
          label="Password baru (opsional)"
          type="password"
          value={password}
          disabled={loading || saving}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kosongkan jika tidak ganti password"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        Role: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{data?.role ?? '-'}</span> | Department:{' '}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{data?.department ?? '-'}</span>
      </div>

      <Button type="submit" disabled={loading || saving || !data} className="h-11 w-full sm:w-auto sm:min-w-[200px]">
        {saving ? 'Menyimpan...' : 'Simpan Profile'}
      </Button>
    </form>
  );
}

