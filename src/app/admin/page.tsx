'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listAdminUserBudgets } from '../../services/budget.services';
import type { AdminUserBudgetRow } from '../../types/types';
import { AdminBudgetSummary } from '../../components/admin/AdminBudgetSummary';
import { formatPositionLabel } from '../../constants/positionLabels';
import { formatRupiah } from '../../utils/amount';
import { Skeleton, SkeletonTableRow } from '../../components/ui/Skeleton';

type AlertUser = {
  userId: string;
  name: string;
  department: string;
  position: string;
  benefitType: 'Rawat Jalan' | 'Rawat Inap' | 'Melahirkan';
  allocated: number;
  spent: number;
  remaining: number;
  pct: number;
};

function asNumber(v: string | number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function AdminDashboardPage() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminUserBudgetRow[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listAdminUserBudgets(year);
        if (!active) return;
        if (!res.success) {
          setError(res.message);
          return;
        }
        setRows(res.data ?? []);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Gagal memuat data dashboard');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [year]);

  // Aggregate KPI numbers
  const kpis = useMemo(() => {
    const totalUsers = rows.length;
    let totalAllocated = 0;
    let totalSpent = 0;

    for (const r of rows) {
      totalAllocated += asNumber(r.rawatJalan.allocated) + asNumber(r.rawatInap.allocated) + asNumber(r.melahirkan?.allocated ?? 0);
      totalSpent += asNumber(r.rawatJalan.spent) + asNumber(r.rawatInap.spent) + asNumber(r.melahirkan?.spent ?? 0);
    }

    const totalRemaining = totalAllocated - totalSpent;
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return {
      totalUsers,
      totalAllocated,
      totalSpent,
      totalRemaining,
      utilizationRate,
    };
  }, [rows]);

  // Risk / High utilization alerts (> 80%)
  const riskAlerts = useMemo<AlertUser[]>(() => {
    const list: AlertUser[] = [];
    for (const r of rows) {
      const fullName = `${r.firstName} ${r.lastName}`.trim();

      // Check Rawat Jalan
      const rjAlloc = asNumber(r.rawatJalan.allocated);
      const rjSpent = asNumber(r.rawatJalan.spent);
      if (rjAlloc > 0) {
        const pct = (rjSpent / rjAlloc) * 100;
        if (pct >= 80) {
          list.push({
            userId: r.userId,
            name: fullName,
            department: r.department,
            position: r.position,
            benefitType: 'Rawat Jalan',
            allocated: rjAlloc,
            spent: rjSpent,
            remaining: rjAlloc - rjSpent,
            pct,
          });
        }
      }

      // Check Rawat Inap
      const riAlloc = asNumber(r.rawatInap.allocated);
      const riSpent = asNumber(r.rawatInap.spent);
      if (riAlloc > 0) {
        const pct = (riSpent / riAlloc) * 100;
        if (pct >= 80) {
          list.push({
            userId: r.userId,
            name: fullName,
            department: r.department,
            position: r.position,
            benefitType: 'Rawat Inap',
            allocated: riAlloc,
            spent: riSpent,
            remaining: riAlloc - riSpent,
            pct,
          });
        }
      }

      // Check Melahirkan
      if (r.melahirkan) {
        const melAlloc = asNumber(r.melahirkan.allocated);
        const melSpent = asNumber(r.melahirkan.spent);
        if (melAlloc > 0) {
          const pct = (melSpent / melAlloc) * 100;
          if (pct >= 80) {
            list.push({
              userId: r.userId,
              name: fullName,
              department: r.department,
              position: r.position,
              benefitType: 'Melahirkan',
              allocated: melAlloc,
              spent: melSpent,
              remaining: melAlloc - melSpent,
              pct,
            });
          }
        }
      }
    }
    return list.sort((a, b) => b.pct - a.pct);
  }, [rows]);

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Monitoring utilisasi budget asuransi seluruh karyawan secara real-time.
          </p>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/user-budgets"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Input Spend / User Budgets
          </Link>
          <Link
            href="/admin/users/create"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            + Tambah User
          </Link>
          <Link
            href="/admin/ledger"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Lihat Ledger
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Active Users */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Karyawan Aktif
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {loading ? <Skeleton className="h-8 w-28" /> : <>{kpis.totalUsers} <span className="text-sm font-normal text-zinc-500">orang</span></>}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Terdaftar di sistem tahun {year}
          </p>
        </div>

        {/* KPI 2: Total Allocated */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Plafon Allocated
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M12 11h.01M16 11h.01M8 11h.01" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {loading ? <Skeleton className="h-8 w-36" /> : money(kpis.totalAllocated)}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Total alokasi budget {year}
          </p>
        </div>

        {/* KPI 3: Total Spent */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Terpakai (Spent)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {loading ? <Skeleton className="h-8 w-36" /> : money(kpis.totalSpent)}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Sisa: {loading ? '...' : money(kpis.totalRemaining)}
          </p>
        </div>

        {/* KPI 4: Utilization Rate */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Utilisasi Budget
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 12A10 10 0 1 1 12 2v10z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {`${kpis.utilizationRate.toFixed(1)}%`}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    kpis.utilizationRate >= 90
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                      : kpis.utilizationRate >= 70
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                  }`}
                >
                  {kpis.utilizationRate >= 90 ? 'Tinggi' : kpis.utilizationRate >= 70 ? 'Sedang' : 'Normal'}
                </span>
              </>
            )}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                kpis.utilizationRate >= 90 ? 'bg-rose-500' : kpis.utilizationRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, kpis.utilizationRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Warning / Risk Alert Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              ⚠️ Peringatan Penggunaan Budget (&gt;80%)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Daftar karyawan yang mendekati atau telah menghabiskan plafon anggaran
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            {riskAlerts.length} Peringatan
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : riskAlerts.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-6 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              ✅ Semua Budget Karyawan Dalam Batas Aman
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              Belum ada karyawan yang menggunakan lebih dari 80% alokasi budget mereka.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="pb-3 pr-4">Karyawan</th>
                  <th className="pb-3 pr-4">Posisi &amp; Dept</th>
                  <th className="pb-3 pr-4">Kategori Benefit</th>
                  <th className="pb-3 pr-4 text-right">Terpakai / Alokasi</th>
                  <th className="pb-3 pr-4 text-right">Sisa</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {riskAlerts.map((item, idx) => {
                  const isOver = item.pct >= 100;
                  return (
                    <tr key={`${item.userId}-${item.benefitType}-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3.5 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-zinc-600 dark:text-zinc-400">
                        <div>{formatPositionLabel(item.position as any)}</div>
                        <div className="text-zinc-400">{item.department}</div>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-zinc-800 dark:text-zinc-200">
                        {item.benefitType}
                      </td>
                      <td className="py-3.5 pr-4 text-right tabular-nums">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {money(item.spent)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          dari {money(item.allocated)}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-right tabular-nums font-semibold">
                        <span className={item.remaining <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                          {money(item.remaining)}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            isOver
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isOver ? '🔴 OVER BUDGET' : `🟡 ${item.pct.toFixed(0)}% TERPAKAI`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics & Charts */}
      <div>
        <AdminBudgetSummary />
      </div>
    </div>
  );
}
