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

function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 5 12 5c4.638 0 8.573 2.837 9.963 6.678a1.012 1.012 0 010 .639C20.577 16.49 16.64 19 12 19c-4.638 0-8.573-2.837-9.963-6.678z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEyeSlash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.338 7.244 19 12 19c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 5c4.756 0 8.773 3.162 10.065 7.098a10.522 10.522 0 01-4.293 5.494M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.728-6.728L3 21"
      />
    </svg>
  );
}

export function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    title: string;
    message: string;
    variant: 'error' | 'success';
  } | null>(null);

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
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await login({ email: form.email.trim(), password: form.password });
      if (!res.success) {
        setFeedback({
          title: 'Login gagal',
          message: res.message,
          variant: 'error',
        });
        return;
      }

      const role = getRoleFromToken(res.token);
      const target = role === 'ADMIN' ? '/admin' : role === 'USER' ? '/budget' : redirectTo;
      setFeedback({
        title: 'Login berhasil',
        message: 'Anda akan diarahkan ke dashboard.',
        variant: 'success',
      });
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      router.replace(target);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        setFeedback({
          title: 'Login gagal',
          message: e.message,
          variant: 'error',
        });
      } else if (e instanceof Error) {
        setFeedback({
          title: 'Login gagal',
          message: e.message,
          variant: 'error',
        });
      } else {
        setFeedback({
          title: 'Login gagal',
          message: 'Terjadi kesalahan yang tidak diketahui',
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {feedback ? (
        <Alert title={feedback.title} message={feedback.message} variant={feedback.variant} />
      ) : null}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={form.email}
        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        disabled={submitting}
      />

      <TextField
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        disabled={submitting}
        endAdornment={
          <button
            type="button"
            className="rounded-lg p-1.5 text-zinc-500 outline-none hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-600"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            aria-pressed={showPassword}
            disabled={submitting}
          >
            {showPassword ? <IconEyeSlash /> : <IconEye />}
          </button>
        }
      />

      <Button type="submit" disabled={!canSubmit} className="h-11">
        {submitting ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  );
}

