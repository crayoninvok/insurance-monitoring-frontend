'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  listAdminUserBudgets,
  listAdminUserLedger,
} from '../../services/budget.services';
import type { AdminUserBudgetRow, AdminUserLedgerEntry } from '../../types/types';
import { Alert } from '../ui/Alert';
import { TextField } from '../ui/TextField';
import { formatBranchLabel } from '../../constants/branchLabels';
import { formatPositionLabel } from '../../constants/positionLabels';
import { formatRupiah } from '../../utils/amount';

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

export function AdminLedgerBrowser() {
  const USER_PAGE_SIZE = 8;
  const LEDGER_PAGE_SIZE = 10;
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 3, current - 2, current - 1, current, current + 1, current + 2];
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminUserBudgetRow[]>([]);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [userPage, setUserPage] = useState(1);

  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerCache, setLedgerCache] = useState<
    Record<string, AdminUserLedgerEntry[] | undefined>
  >({});
  const [ledgerPageByUser, setLedgerPageByUser] = useState<Record<string, number>>({});

  const positionOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.position))).sort(), [rows]);
  const departmentOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.department))).sort(), [rows]);
  const branchOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.branch))).sort(), [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q);
      const matchesPos = !positionFilter || r.position === positionFilter;
      const matchesDept = !departmentFilter || r.department === departmentFilter;
      const matchesBranch = !branchFilter || r.branch === branchFilter;
      return matchesSearch && matchesPos && matchesDept && matchesBranch;
    });
  }, [rows, search, positionFilter, departmentFilter, branchFilter]);

  const userTotalPages = Math.max(1, Math.ceil(filteredRows.length / USER_PAGE_SIZE));
  const pagedRows = useMemo(() => {
    const start = (userPage - 1) * USER_PAGE_SIZE;
    return filteredRows.slice(start, start + USER_PAGE_SIZE);
  }, [filteredRows, userPage]);

  const summary = useMemo(() => {
    const toNum = (v: string) => Number(v || '0');
    const users = filteredRows.length;
    const totalRJAllocated = filteredRows.reduce((acc, r) => acc + toNum(r.rawatJalan.allocated), 0);
    const totalRJSpent = filteredRows.reduce((acc, r) => acc + toNum(r.rawatJalan.spent), 0);
    const totalRJRemaining = totalRJAllocated - totalRJSpent;
    const totalRISpent = filteredRows.reduce((acc, r) => acc + toNum(r.rawatInap.spent), 0);
    const totalMelSpent = filteredRows.reduce((acc, r) => acc + toNum(r.melahirkan?.spent ?? '0'), 0);
    return {
      users,
      totalRJAllocated,
      totalRJSpent,
      totalRJRemaining,
      totalRISpent,
      totalMelSpent,
      totalInsuranceSpent: totalRJSpent + totalRISpent + totalMelSpent,
    };
  }, [filteredRows]);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminUserBudgets(year);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setRows(res.data ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal memuat user budgets';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    setOpenUserId(null);
    setLedgerError(null);
    setLedgerCache({});
    setLedgerPageByUser({});
    setUserPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    setUserPage(1);
  }, [search, positionFilter, departmentFilter, branchFilter]);

  useEffect(() => {
    if (userPage > userTotalPages) setUserPage(userTotalPages);
  }, [userPage, userTotalPages]);

  async function openLedger(userId: string) {
    if (openUserId === userId) {
      setOpenUserId(null);
      setLedgerError(null);
      return;
    }

    setOpenUserId(userId);
    setLedgerError(null);
    setLedgerPageByUser((prev) => ({ ...prev, [userId]: 1 }));

    if (ledgerCache[userId]) return; // sudah ada cache

    setLedgerLoading(true);
    try {
      const res = await listAdminUserLedger(userId, year);
      if (!res.success) {
        setLedgerError(res.message);
        return;
      }
      setLedgerCache((prev) => ({
        ...prev,
        [userId]: res.data ?? [],
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal memuat ledger user';
      setLedgerError(message);
    } finally {
      setLedgerLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <Alert title="Error" message={error} /> : null}

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end dark:border-zinc-800 dark:bg-zinc-950">
        <TextField
          label="Year"
          type="number"
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          disabled={loading}
          inputMode="numeric"
        />

        <div className="flex flex-wrap gap-2">
          {yearOptions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              disabled={loading}
              className={
                y === year
                  ? 'rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800'
                  : 'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/50'
              }
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-950">
        <TextField
          label="Search User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nama atau user ID"
          disabled={loading}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Filter Position</label>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
          >
            <option value="">Semua position</option>
            {positionOptions.map((p) => (
              <option key={p} value={p}>
                {formatPositionLabel(p as any)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Filter Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
          >
            <option value="">Semua departemen</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Filter Branch</label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
          >
            <option value="">Semua branch</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {formatBranchLabel(b as any)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Users</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.users}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">RJ Allocated</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatRupiah(summary.totalRJAllocated)}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">RJ Spent</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatRupiah(summary.totalRJSpent)}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Rawat Jalan Credits Remaining</div>
          <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(summary.totalRJRemaining)}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Rawat Inap Spent</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatRupiah(summary.totalRISpent)}</div>
        </div>
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300 dark:text-zinc-700">Total Insurance Spent</div>
          <div className="mt-1 text-lg font-bold">{formatRupiah(summary.totalInsuranceSpent)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {pagedRows.length === 0 && !loading ? (
            <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">
              Tidak ada data yang cocok untuk filter saat ini.
            </div>
          ) : null}

          {pagedRows.map((r) => {
            const isOpen = openUserId === r.userId;
            const ledgerEntries = ledgerCache[r.userId];
            const sortedLedgerEntries =
              ledgerEntries?.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)) ?? [];
            const ledgerPage = ledgerPageByUser[r.userId] ?? 1;
            const ledgerTotalPages = Math.max(1, Math.ceil(sortedLedgerEntries.length / LEDGER_PAGE_SIZE));
            const pagedLedgerEntries = sortedLedgerEntries.slice(
              (ledgerPage - 1) * LEDGER_PAGE_SIZE,
              ledgerPage * LEDGER_PAGE_SIZE,
            );

            return (
              <div key={r.userId} className="p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => void openLedger(r.userId)}
                  disabled={loading || ledgerLoading}
                  className="w-full text-left"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {r.department} · {formatBranchLabel(r.branch)} · {formatPositionLabel(r.position)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-start gap-x-8 gap-y-2 sm:justify-end">
                      <div className="text-right">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Rawat Jalan Allocated
                        </div>
                        <div className="tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatRupiah(r.rawatJalan.allocated)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Rawat Jalan Spent
                        </div>
                        <div className="tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatRupiah(r.rawatJalan.spent)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Rawat Jalan Credits Remaining
                        </div>
                        <div className="tabular-nums text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatRupiah(r.rawatJalan.remaining)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Rawat Inap Spent
                        </div>
                        <div className="tabular-nums text-sm font-semibold text-rose-700 dark:text-rose-300">
                          {formatRupiah(r.rawatInap.spent)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Total Insurance Spent
                        </div>
                        <div className="tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatRupiah(
                            (Number(r.rawatJalan.spent) || 0) +
                              (Number(r.rawatInap.spent) || 0) +
                              (r.melahirkan ? Number(r.melahirkan.spent) || 0 : 0),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="mt-3">
                    {ledgerError ? <Alert title="Error" message={ledgerError} /> : null}

                    {ledgerLoading && ledgerEntries === undefined ? (
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">
                        Memuat ledger...
                      </div>
                    ) : null}

                    {ledgerEntries !== undefined ? (
                      ledgerEntries.length > 0 ? (
                        <>
                          <div className="overflow-x-auto">
                            <table className="min-w-[860px] w-full table-fixed text-sm">
                              <thead>
                                <tr className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                  <th className="w-[150px] px-2 py-2 text-left">Tanggal</th>
                                  <th className="w-[110px] px-2 py-2 text-left">Jenis</th>
                                  <th className="w-[140px] px-2 py-2 text-left">Benefit</th>
                                  <th className="w-[240px] px-2 py-2 text-left">Detail</th>
                                  <th className="w-[140px] px-2 py-2 text-right">Amount</th>
                                  <th className="px-2 py-2 text-left">Documents</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pagedLedgerEntries.map((e) => (
                                  <tr
                                    key={e.id}
                                    className="border-t border-zinc-200 dark:border-zinc-800"
                                  >
                                    <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">
                                      {formatDate(e.createdAt)}
                                    </td>
                                    <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">
                                      {e.type}
                                    </td>
                                    <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">
                                      {e.benefitType ?? (e.spendCategory ?? '-')}
                                    </td>
                                    <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">
                                      {(() => {
                                        if (e.benefitType === 'RAWAT_JALAN') {
                                          return e.rawatJalanMedical?.name ?? '-';
                                        }
                                        if (e.benefitType === 'RAWAT_INAP') {
                                          const label = e.rawatInapEpisode?.sickConditionLabel ?? '-';
                                          const st = e.rawatInapServiceType ?? '-';
                                          return `${label} · ${st}`;
                                        }
                                        if (e.benefitType === 'MELAHIRKAN') {
                                          return 'Melahirkan';
                                        }
                                        return e.spendCategory ?? '-';
                                      })()}
                                    </td>
                                    <td className="px-2 py-2 text-right text-zinc-700 dark:text-zinc-200 tabular-nums">
                                      {formatRupiah(e.amount)}
                                    </td>
                                    <td className="max-w-[260px] px-2 py-2 text-zinc-700 dark:text-zinc-200">
                                      {e.documentUrl ? (
                                        <a
                                          href={e.documentUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                          Lihat dokumen
                                        </a>
                                      ) : (
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {sortedLedgerEntries.length > LEDGER_PAGE_SIZE ? (
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Page {ledgerPage} / {ledgerTotalPages} ({sortedLedgerEntries.length} entries)
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200"
                                  disabled={ledgerPage <= 1}
                                  onClick={() =>
                                    setLedgerPageByUser((prev) => ({
                                      ...prev,
                                      [r.userId]: Math.max(1, ledgerPage - 1),
                                    }))
                                  }
                                >
                                  Prev
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200"
                                  disabled={ledgerPage >= ledgerTotalPages}
                                  onClick={() =>
                                    setLedgerPageByUser((prev) => ({
                                      ...prev,
                                      [r.userId]: Math.min(ledgerTotalPages, ledgerPage + 1),
                                    }))
                                  }
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <Alert title="Info" message="Ledger belum ada untuk user ini." />
                      )
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {filteredRows.length > USER_PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Page {userPage} / {userTotalPages} ({filteredRows.length} users)
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200"
              disabled={userPage <= 1}
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200"
              disabled={userPage >= userTotalPages}
              onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

