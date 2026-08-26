'use client';

import { useEffect, useMemo, useState } from 'react';
import { getMe } from '../../services/auth.services';
import { getMyBudget, getMyLedger } from '../../services/budget.services';
import type { AdminUserLedgerEntry, MyBudget, UserProfile } from '../../types/types';
import { DocumentPreviewModal } from '../../components/ui/DocumentPreviewModal';
import { formatBranchLabel } from '../../constants/branchLabels';
import { formatPositionLabel } from '../../constants/positionLabels';
import { Skeleton, SkeletonCard, SkeletonTableRow } from '../../components/ui/Skeleton';

function asNumber(v: string | number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ledgerDetailText(e: AdminUserLedgerEntry): string {
  if (e.benefitType === 'RAWAT_JALAN') {
    return e.rawatJalanMedical?.name ?? 'Rawat Jalan';
  }
  if (e.benefitType === 'RAWAT_INAP') {
    const label = e.rawatInapEpisode?.sickConditionLabel ?? '-';
    const st = e.rawatInapServiceType ?? '-';
    return `${label} (${st})`;
  }
  if (e.benefitType === 'MELAHIRKAN') {
    return 'Melahirkan';
  }
  return e.spendCategory ?? '-';
}

export default function UserBudgetDashboardPage() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budget, setBudget] = useState<MyBudget | null>(null);
  const [ledger, setLedger] = useState<AdminUserLedgerEntry[]>([]);
  const [benefitFilter, setBenefitFilter] = useState<string>('ALL');

  // Preview modal state
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocLabel, setPreviewDocLabel] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 2, current - 1, current, current + 1, current + 2];
  }, []);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [meRes, budgetRes, ledgerRes] = await Promise.all([
          getMe(),
          getMyBudget(year),
          getMyLedger(year),
        ]);

        if (!active) return;
        if (!meRes.success) return void setError(meRes.message);
        if (!budgetRes.success) return void setError(budgetRes.message);

        setProfile(meRes.data);
        setBudget(budgetRes.data);

        if (ledgerRes.success) {
          setLedger(ledgerRes.data ?? []);
        } else {
          setLedger([]);
        }
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Gagal memuat data budget');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    return () => {
      active = false;
    };
  }, [year]);

  // Filtered ledger entries
  const filteredLedger = useMemo(() => {
    if (benefitFilter === 'ALL') return ledger;
    return ledger.filter((e) => e.benefitType === benefitFilter);
  }, [ledger, benefitFilter]);

  // Calculations for progress bars
  const rjAlloc = asNumber(budget?.rawatJalan.allocated ?? 0);
  const rjSpent = asNumber(budget?.rawatJalan.spent ?? 0);
  const rjRem = asNumber(budget?.rawatJalan.remaining ?? 0);
  const rjPct = rjAlloc > 0 ? (rjSpent / rjAlloc) * 100 : 0;

  const riAlloc = asNumber(budget?.rawatInap.allocated ?? 0);
  const riSpent = asNumber(budget?.rawatInap.spent ?? 0);
  const riRem = asNumber(budget?.rawatInap.remaining ?? 0);
  const riPct = riAlloc > 0 ? (riSpent / riAlloc) * 100 : 0;

  const melAlloc = asNumber(budget?.melahirkan?.allocated ?? 0);
  const melSpent = asNumber(budget?.melahirkan?.spent ?? 0);
  const melRem = asNumber(budget?.melahirkan?.remaining ?? 0);
  const melPct = melAlloc > 0 ? (melSpent / melAlloc) * 100 : 0;

  function openPreview(url: string, label: string) {
    setPreviewDocUrl(url);
    setPreviewDocLabel(label);
    setPreviewOpen(true);
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* User Header Card */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-6 text-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white backdrop-blur">
                {profile ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'Karyawan'}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <span className="rounded-md bg-white/15 px-2 py-0.5 font-medium">
                    {profile ? formatPositionLabel(profile.position) : '-'}
                  </span>
                  <span>•</span>
                  <span>{profile?.department}</span>
                  <span>•</span>
                  <span>{profile ? formatBranchLabel(profile.branch) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/70">Tahun:</span>
              {yearOptions.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    y === year
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {/* 3 Benefit Category Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Card 1: Rawat Jalan */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              🩺 Rawat Jalan
            </span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {rjPct.toFixed(0)}% Terpakai
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Sisa Plafon</div>
            <div className="mt-0.5 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {loading ? <Skeleton className="h-8 w-32" /> : money(rjRem)}
            </div>
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Alokasi Tahunan:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{loading ? '...' : money(rjAlloc)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Terpakai:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">{loading ? '...' : money(rjSpent)}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rjPct >= 90 ? 'bg-rose-500' : rjPct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, rjPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Rawat Inap */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              🏥 Rawat Inap
            </span>
            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-bold text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
              {riPct.toFixed(0)}% Terpakai
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Sisa Plafon</div>
            <div className="mt-0.5 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {loading ? <Skeleton className="h-8 w-32" /> : money(riRem)}
            </div>
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Alokasi Episode:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{loading ? '...' : money(riAlloc)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Terpakai:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">{loading ? '...' : money(riSpent)}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  riPct >= 90 ? 'bg-rose-500' : riPct >= 70 ? 'bg-amber-500' : 'bg-pink-500'
                }`}
                style={{ width: `${Math.min(100, riPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Melahirkan */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              👶 Melahirkan
            </span>
            {profile?.gender === 'FEMALE' ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                {melPct.toFixed(0)}% Terpakai
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                N/A (Pria)
              </span>
            )}
          </div>

          {profile?.gender === 'FEMALE' ? (
            <>
              <div className="mt-4">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Sisa Plafon</div>
                <div className="mt-0.5 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {loading ? <Skeleton className="h-8 w-32" /> : money(melRem)}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Alokasi Tahunan:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{loading ? '...' : money(melAlloc)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Terpakai:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{loading ? '...' : money(melSpent)}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      melPct >= 90 ? 'bg-rose-500' : melPct >= 70 ? 'bg-amber-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, melPct)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 text-center text-xs text-zinc-400">
              Fasilitas benefit melahirkan hanya berlaku untuk karyawan wanita.
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              📜 Riwayat Penggunaan &amp; Klaim ({year})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Daftar seluruh transaksi alokasi dan pengeluaran asuransi Anda
            </p>
          </div>

          {/* Benefit Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'ALL', label: 'Semua' },
              { key: 'RAWAT_JALAN', label: 'Rawat Jalan' },
              { key: 'RAWAT_INAP', label: 'Rawat Inap' },
              { key: 'MELAHIRKAN', label: 'Melahirkan' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setBenefitFilter(tab.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  benefitFilter === tab.key
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredLedger.length === 0 ? (
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 py-12 text-center dark:border-zinc-900 dark:bg-zinc-900/30">
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              Belum Ada Transaksi
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Tidak ada catatan transaksi untuk kategori yang dipilih pada tahun {year}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="pb-3 pr-4">Tanggal</th>
                  <th className="pb-3 pr-4">Tipe</th>
                  <th className="pb-3 pr-4">Detail Benefit / Klinik</th>
                  <th className="pb-3 pr-4 text-right">Nominal</th>
                  <th className="pb-3 pr-4">Catatan</th>
                  <th className="pb-3 text-center">Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredLedger.map((entry) => {
                  const isSpend = entry.type === 'SPEND';
                  const isAllocate = entry.type === 'ALLOCATE';
                  const docUrl = entry.documentUrl;

                  return (
                    <tr key={entry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3.5 pr-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                            isSpend
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isAllocate
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {ledgerDetailText(entry)}
                      </td>
                      <td
                        className={`py-3.5 pr-4 text-right tabular-nums font-bold ${
                          isSpend ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isSpend ? `- ${money(asNumber(entry.amount))}` : money(asNumber(entry.amount))}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.note || '-'}
                      </td>
                      <td className="py-3.5 text-center">
                        {docUrl ? (
                          <button
                            type="button"
                            onClick={() => openPreview(docUrl, entry.documentOriginalName || 'Dokumen Klaim')}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                          >
                            📎 Lihat
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        url={previewDocUrl}
        fileLabel={previewDocLabel}
      />
    </div>
  );
}
