'use client';

import { useEffect, useMemo, useState } from 'react';
import { getMyBudget } from '../../services/budget.services';
import type { MyBudget } from '../../types/types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

export function MyBudgetWidget() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MyBudget | null>(null);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const res = await getMyBudget(year);
        if (!res.success) {
          setError(res.message);
          return;
        }
        setData(res.data);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Gagal memuat budget';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [year]);

  async function onRefresh() {
    setYear((y) => y);
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? <Alert title="Error" message={error} /> : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextField
          label="Year"
          type="number"
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          disabled={loading}
          inputMode="numeric"
        />

        <div className="flex gap-2">
          {yearOptions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              disabled={loading}
              className={
                y === year
                  ? 'rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800'
                  : 'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100'
              }
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Rawat Jalan</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-400">Allocated</div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {data?.rawatJalan.allocated ?? (loading ? '...' : '-')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-400">Spent</div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {data?.rawatJalan.spent ?? (loading ? '...' : '-')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-400">Remaining</div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {data?.rawatJalan.remaining ?? (loading ? '...' : '-')}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Rawat Inap</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-400">Allocated</div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {data?.rawatInap.allocated ?? (loading ? '...' : '-')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-400">Spent</div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {data?.rawatInap.spent ?? (loading ? '...' : '-')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-400">Remaining</div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {data?.rawatInap.remaining ?? (loading ? '...' : '-')}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Melahirkan</div>
          {data?.melahirkan === null && !loading ? (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Tidak tersedia (Male user).
            </div>
          ) : (
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-zinc-600 dark:text-zinc-400">Allocated</div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {data?.melahirkan?.allocated ?? (loading ? '...' : '-')}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-600 dark:text-zinc-400">Spent</div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {data?.melahirkan?.spent ?? (loading ? '...' : '-')}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-600 dark:text-zinc-400">Remaining</div>
                <div className="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                  {data?.melahirkan?.remaining ?? (loading ? '...' : '-')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onRefresh} disabled={loading} className="h-11 min-w-[160px]">
          Refresh
        </Button>
      </div>
    </div>
  );
}

