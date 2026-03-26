'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../services/auth.services';
import { ApiError } from '../../services/api';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

type FormState = {
  email: string;
  password: string;
};

export function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getRoleFromToken(token: string): 'ADMIN' | 'USER' | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const parsed = JSON.parse(json) as { role?: unknown };
      if (parsed.role === 'ADMIN') return 'ADMIN';
      if (parsed.role === 'USER') return 'USER';
      return null;
    } catch {
      return null;
    }
  }

  const canSubmit = useMemo(() => {
    return form.email.trim().length > 0 && form.password.trim().length > 0 && !submitting;
  }, [form.email, form.password, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login({ email: form.email.trim(), password: form.password });
      if (!res.success) {
        setError(res.message);
        return;
      }

      const role = getRoleFromToken(res.token);
      const target = role === 'ADMIN' ? '/admin/budget' : role === 'USER' ? '/budget' : redirectTo;
      router.replace(target);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {error ? <Alert title="Login gagal" message={error} /> : null}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="admin@local.test"
        value={form.email}
        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        disabled={submitting}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        disabled={submitting}
      />

      <Button type="submit" disabled={!canSubmit} className="h-11">
        {submitting ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  );
}

