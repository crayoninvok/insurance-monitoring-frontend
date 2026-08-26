'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  listAdminOptionTrends,
  listAdminUserBudgets,
  listMelahirkanPolicies,
  listRawatInapPolicies,
  listRawatJalanPolicies,
} from '../../services/budget.services';
import type {
  AdminOptionTrendItem,
  AdminUserBudgetRow,
  MelahirkanPolicy,
  RawatInapPolicy,
  RawatJalanPolicy,
} from '../../types/types';
import {
  DonutSpendChart,
  DeptUtilizationChart,
  TrendBarChart,
  PolicyPositionChart,
  TREND_COLOR_RJ,
  TREND_COLOR_RI,
} from './AdminCharts';
import type {
  DonutChartDatum,
  DeptUtilizationDatum,
  TrendDatum,
  PolicyPositionDatum,
} from './AdminCharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asNumber(v: string | number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const DEPT_SHORT: Record<string, string> = {
  HRGA: 'HRGA',
  FINANCE: 'Finance',
  PROCUREMENT: 'Procurement',
  OPERATIONS: 'Operations',
  PLANT: 'Plant',
  INFRASTRUCTURE: 'Infra',
  LOGISTICS: 'Logistics',
  TRAINING_CENTER: 'Training',
  MANAGEMENT: 'Mgmt',
};

const POSITION_SHORT: Record<string, string> = {
  DIRECTOR: 'Director',
  MANAGER: 'Manager',
  SUPERINTENDENT: 'Supt.',
  SUPERVISOR: 'Spv.',
  JUNIOR_SUPERVISOR: 'Jr. Spv.',
  WORKER: 'Worker',
};

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
      {subtitle && (
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>
      )}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function ChartCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
      style={{ height }}
    />
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
          : 'rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'
      }
    >
      <div
        className={`text-xs font-semibold uppercase tracking-wide ${
          highlight ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-bold ${
          highlight ? '' : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </div>
      {sub && (
        <div
          className={`mt-1 text-xs ${
            highlight ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminBudgetSummary() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rawatJalan, setRawatJalan] = useState<RawatJalanPolicy[]>([]);
  const [rawatInap, setRawatInap] = useState<RawatInapPolicy[]>([]);
  const [melahirkan, setMelahirkan] = useState<MelahirkanPolicy[]>([]);
  const [rjTrends, setRjTrends] = useState<AdminOptionTrendItem[]>([]);
  const [riTrends, setRiTrends] = useState<AdminOptionTrendItem[]>([]);
  const [userBudgets, setUserBudgets] = useState<AdminUserBudgetRow[]>([]);

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
        const [rjRes, riRes, melRes, trendRes, userBudgetRes] = await Promise.all([
          listRawatJalanPolicies(year),
          listRawatInapPolicies(year),
          listMelahirkanPolicies(year),
          listAdminOptionTrends(year),
          listAdminUserBudgets(year),
        ]);
        if (!active) return;
        if (!rjRes.success) return void setError(rjRes.message);
        if (!riRes.success) return void setError(riRes.message);
        if (!melRes.success) return void setError(melRes.message);
        if (!trendRes.success) return void setError(trendRes.message);
        if (!userBudgetRes.success) return void setError(userBudgetRes.message);

        setRawatJalan(rjRes.data ?? []);
        setRawatInap(riRes.data ?? []);
        setMelahirkan(melRes.data ?? []);
        setRjTrends(trendRes.data.rawatJalan ?? []);
        setRiTrends(trendRes.data.rawatInap ?? []);
        setUserBudgets(userBudgetRes.data ?? []);
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

  // ── KPI totals ──────────────────────────────────────────────────────────────

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

  // ── Chart data: Donut — actual spend per benefit ────────────────────────────

  const donutData = useMemo<DonutChartDatum[]>(() => {
    let rjSpent = 0;
    let riSpent = 0;
    let melSpent = 0;
    for (const u of userBudgets) {
      rjSpent += asNumber(u.rawatJalan.spent);
      riSpent += asNumber(u.rawatInap.spent);
      melSpent += asNumber(u.melahirkan?.spent ?? 0);
    }
    const items: DonutChartDatum[] = [
      { name: 'Rawat Jalan', value: rjSpent },
      { name: 'Rawat Inap', value: riSpent },
    ];
    if (melSpent > 0) items.push({ name: 'Melahirkan', value: melSpent });
    return items.filter((d) => d.value > 0);
  }, [userBudgets]);

  // ── Chart data: Bar — dept utilization ─────────────────────────────────────

  const deptData = useMemo<DeptUtilizationDatum[]>(() => {
    const map: Record<string, { allocated: number; spent: number }> = {};
    for (const u of userBudgets) {
      const dept = DEPT_SHORT[u.department] ?? u.department;
      if (!map[dept]) map[dept] = { allocated: 0, spent: 0 };
      map[dept].allocated += asNumber(u.rawatJalan.allocated) + asNumber(u.rawatInap.allocated);
      map[dept].spent += asNumber(u.rawatJalan.spent) + asNumber(u.rawatInap.spent);
    }
    return Object.entries(map)
      .map(([dept, v]) => ({ dept, ...v }))
      .sort((a, b) => b.allocated - a.allocated);
  }, [userBudgets]);

  // ── Chart data: Trend bars ─────────────────────────────────────────────────

  const rjTrendData = useMemo<TrendDatum[]>(
    () =>
      rjTrends.slice(0, 6).map((t) => ({
        name: t.optionName,
        amount: asNumber(t.totalAmount),
        count: t.count,
      })),
    [rjTrends],
  );

  const riTrendData = useMemo<TrendDatum[]>(
    () =>
      riTrends.slice(0, 6).map((t) => ({
        name: t.optionName,
        amount: asNumber(t.totalAmount),
        count: t.count,
      })),
    [riTrends],
  );

  // ── Chart data: Policy by position ─────────────────────────────────────────

  const policyPositionData = useMemo<PolicyPositionDatum[]>(() => {
    const positionOrder = [
      'DIRECTOR',
      'MANAGER',
      'SUPERINTENDENT',
      'SUPERVISOR',
      'JUNIOR_SUPERVISOR',
      'WORKER',
    ];
    return positionOrder
      .map((pos) => {
        const rj = rawatJalan.find((p) => p.position === pos);
        // Rawat Inap: sum all service types for the same position
        const ri = rawatInap
          .filter((p) => p.position === pos)
          .reduce((s, p) => s + asNumber(p.capAmount), 0);
        const mel = melahirkan.find((p) => p.position === pos);
        return {
          position: POSITION_SHORT[pos] ?? pos,
          rawatJalan: asNumber(rj?.annualAmount ?? 0),
          rawatInap: ri,
          melahirkan: asNumber(mel?.annualAmount ?? 0),
        };
      })
      .filter((d) => d.rawatJalan + d.rawatInap + d.melahirkan > 0);
  }, [rawatJalan, rawatInap, melahirkan]);

  const money = (n: number) =>
    n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const hasSpendData = donutData.length > 0;
  const hasDeptData = deptData.length > 0;
  const hasPolicyData = policyPositionData.length > 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60 sm:p-6">
      {/* ── Header + Year Picker ── */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Summary &amp; Analytics
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Ringkasan policy &amp; utilisasi budget per tahun.
          </div>
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

      {/* ── KPI Cards ── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Rawat Jalan"
          value={money(totals.totalRawatJalan)}
          sub={`${totals.countRawatJalan} policy`}
        />
        <KpiCard
          label="Total Rawat Inap"
          value={money(totals.totalRawatInap)}
          sub={`${totals.countRawatInap} policy`}
        />
        <KpiCard
          label="Total Melahirkan"
          value={money(totals.totalMelahirkan)}
          sub={`${totals.countMelahirkan} policy`}
        />
        <KpiCard
          label="Budget Highlight"
          value={money(totals.grand)}
          sub={loading ? 'Memuat...' : `Year ${year}`}
          highlight
        />
      </div>

      {/* ── Row 1: Donut + Dept Utilization ── */}
      <div className="mb-4 grid gap-4 lg:grid-cols-5">
        {/* Donut */}
        <ChartCard className="lg:col-span-2">
          <SectionHeader
            title="Realisasi Spend per Benefit"
            subtitle="Total pengeluaran aktual seluruh karyawan"
          />
          {loading ? (
            <ChartSkeleton height={280} />
          ) : hasSpendData ? (
            <DonutSpendChart data={donutData} />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-900">
              Belum ada transaksi di tahun ini.
            </div>
          )}
        </ChartCard>

        {/* Dept utilization bar */}
        <ChartCard className="lg:col-span-3">
          <SectionHeader
            title="Utilisasi Budget per Departemen"
            subtitle="Alokasi vs Terpakai (Rawat Jalan + Rawat Inap)"
          />
          {loading ? (
            <ChartSkeleton height={260} />
          ) : hasDeptData ? (
            <DeptUtilizationChart data={deptData} />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-900">
              Belum ada data user di tahun ini.
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Policy by Position (full width) ── */}
      <div className="mb-4">
        <ChartCard>
          <SectionHeader
            title="Policy Budget per Posisi"
            subtitle="Komposisi alokasi Rawat Jalan, Rawat Inap, dan Melahirkan per jabatan"
          />
          {loading ? (
            <ChartSkeleton height={260} />
          ) : hasPolicyData ? (
            <PolicyPositionChart data={policyPositionData} />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-900">
              Belum ada policy yang diset untuk tahun ini.
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Trend Charts ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard>
          <SectionHeader
            title="Top Spend — Rawat Jalan"
            subtitle="Klinik/tindakan terbanyak berdasarkan total nominal"
          />
          {loading ? (
            <ChartSkeleton height={200} />
          ) : rjTrendData.length > 0 ? (
            <TrendBarChart data={rjTrendData} color={TREND_COLOR_RJ} />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-900">
              Belum ada transaksi Rawat Jalan di tahun ini.
            </div>
          )}
        </ChartCard>

        <ChartCard>
          <SectionHeader
            title="Top Spend — Rawat Inap"
            subtitle="Episode terbanyak berdasarkan total nominal"
          />
          {loading ? (
            <ChartSkeleton height={200} />
          ) : riTrendData.length > 0 ? (
            <TrendBarChart data={riTrendData} color={TREND_COLOR_RI} />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-900">
              Belum ada transaksi Rawat Inap di tahun ini.
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
