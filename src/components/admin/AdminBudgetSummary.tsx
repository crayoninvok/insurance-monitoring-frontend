'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  listAdminOptionTrends,
  listMelahirkanPolicies,
  listRawatInapPolicies,
  listRawatJalanPolicies,
} from '../../services/budget.services';
import type {
  AdminOptionTrendItem,
  MelahirkanPolicy,
  RawatInapPolicy,
  RawatJalanPolicy,
} from '../../types/types';

function asNumber(v: string | number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function AdminBudgetSummary() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawatJalan, setRawatJalan] = useState<RawatJalanPolicy[]>([]);
  const [rawatInap, setRawatInap] = useState<RawatInapPolicy[]>([]);
  const [melahirkan, setMelahirkan] = useState<MelahirkanPolicy[]>([]);
  const [rjTrends, setRjTrends] = useState<AdminOptionTrendItem[]>([]);
  const [riTrends, setRiTrends] = useState<AdminOptionTrendItem[]>([]);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 2, current - 1, current, current + 1, current + 2];
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rjRes, riRes, melRes, trendRes] = await Promise.all([
          listRawatJalanPolicies(year),
          listRawatInapPolicies(year),
          listMelahirkanPolicies(year),
          listAdminOptionTrends(year),
        ]);
        if (!active) return;
        if (!rjRes.success) return void setError(rjRes.message);
        if (!riRes.success) return void setError(riRes.message);
        if (!melRes.success) return void setError(melRes.message);
        if (!trendRes.success) return void setError(trendRes.message);
        setRawatJalan(rjRes.data ?? []);
        setRawatInap(riRes.data ?? []);
        setMelahirkan(melRes.data ?? []);
        setRjTrends(trendRes.data.rawatJalan ?? []);
        setRiTrends(trendRes.data.rawatInap ?? []);
      } catch (e) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Gagal memuat summary budget';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [year]);

  const totals = useMemo(() => {
    const totalRawatJalan = rawatJalan.reduce((acc, x) => acc + asNumber(x.annualAmount), 0);
    const totalRawatInap = rawatInap.reduce((acc, x) => acc + asNumber(x.capAmount), 0);
    const totalMelahirkan = melahirkan.reduce((acc, x) => acc + asNumber(x.annualAmount), 0);
    const grand = totalRawatJalan + totalRawatInap + totalMelahirkan;
    return {
      totalRawatJalan,
      totalRawatInap,
      totalMelahirkan,
      grand,
      countRawatJalan: rawatJalan.length,
      countRawatInap: rawatInap.length,
      countMelahirkan: melahirkan.length,
    };
  }, [rawatJalan, rawatInap, melahirkan]);

  const money = (n: number) =>
    n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Summary Data</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Ringkasan policy budget per tahun.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {yearOptions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={
                y === year
                  ? 'rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200'
              }
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total Rawat Jalan</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{money(totals.totalRawatJalan)}</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{totals.countRawatJalan} policy</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total Rawat Inap</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{money(totals.totalRawatInap)}</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{totals.countRawatInap} policy</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total Melahirkan</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{money(totals.totalMelahirkan)}</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{totals.countMelahirkan} policy</div>
        </div>
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300 dark:text-zinc-700">Budget Highlight</div>
          <div className="mt-1 text-lg font-bold">{money(totals.grand)}</div>
          <div className="mt-1 text-xs text-zinc-300 dark:text-zinc-700">{loading ? 'Memuat...' : `Year ${year}`}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Trend Rawat Jalan Options</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Top option berdasarkan total spend</div>
          <div className="mt-3 space-y-2">
            {rjTrends.slice(0, 3).map((t) => (
              <div key={t.optionId} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.optionName}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.count} transaksi</div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {money(asNumber(t.totalAmount))}
                </div>
              </div>
            ))}
            {rjTrends.length === 0 ? (
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                Belum ada transaksi Rawat Jalan di year ini.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Trend Rawat Inap Episode Options</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Top episode option berdasarkan total spend</div>
          <div className="mt-3 space-y-2">
            {riTrends.slice(0, 3).map((t) => (
              <div key={t.optionId} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.optionName}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.count} transaksi</div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-rose-700 dark:text-rose-300">
                  {money(asNumber(t.totalAmount))}
                </div>
              </div>
            ))}
            {riTrends.length === 0 ? (
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                Belum ada transaksi Rawat Inap di year ini.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

