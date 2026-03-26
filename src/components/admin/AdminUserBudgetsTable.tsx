'use client';

import { useEffect, useMemo, useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Toaster, toast } from 'sonner';
import {
  adminResetUserTransactions,
  adminSpendForUser,
  listRawatInapEpisodeOptions,
  listRawatInapEpisodes,
  listRawatJalanMedicals,
  listAdminUserBudgets,
  uploadSpendDocument,
} from '../../services/budget.services';
import type { AdminUserBudgetRow } from '../../types/types';
import type {
  BenefitType,
  RawatInapEpisode,
  RawatInapEpisodeOption,
  RawatJalanMedical,
} from '../../types/types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { formatBranchLabel } from '../../constants/branchLabels';
import { formatPositionLabel } from '../../constants/positionLabels';
import { formatRupiah, parseRupiah } from '../../utils/amount';

type SpendMap = Record<string, string>;

function formatUserId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export function AdminUserBudgetsTable() {
  const PAGE_SIZE = 8;
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminUserBudgetRow[]>([]);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [resetTargetUserId, setResetTargetUserId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [spendInput, setSpendInput] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  const [benefitType, setBenefitType] = useState<BenefitType>('RAWAT_JALAN');

  const [rawatJalanMedicals, setRawatJalanMedicals] = useState<RawatJalanMedical[]>([]);
  const [rawatJalanMedicalId, setRawatJalanMedicalId] = useState<string>('');

  const [rawatInapEpisodes, setRawatInapEpisodes] = useState<RawatInapEpisode[]>([]);
  const [rawatInapEpisodeOptionId, setRawatInapEpisodeOptionId] = useState<string>('');
  const [rawatInapEpisodeOptions, setRawatInapEpisodeOptions] = useState<RawatInapEpisodeOption[]>([]);
  /** Tarif kamar per hari × hari → bucket TARIF_KAMAR_DAYS */
  const [riRoomRatePerDay, setRiRoomRatePerDay] = useState('');
  const [riDays, setRiDays] = useState('1');
  const [riIsOperasi, setRiIsOperasi] = useState(false);
  /** Nominal operasi atau tanpa operasi sesuai toggle */
  const [riProcedureAmount, setRiProcedureAmount] = useState('');
  const [spendDocumentFile, setSpendDocumentFile] = useState<File | null>(null);
  const [spendDocumentMeta, setSpendDocumentMeta] = useState<{
    url: string;
    publicId: string;
    originalName: string;
  } | null>(null);
  const [spendDocumentUploading, setSpendDocumentUploading] = useState(false);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 3, current - 2, current - 1, current, current + 1, current + 2];
  }, []);

  const rawatInapComputed = useMemo(() => {
    const rate = parseRupiah(riRoomRatePerDay);
    const daysNum = Math.floor(Number(riDays));
    const procParsed = parseRupiah(riProcedureAmount);
    const procedureNum =
      procParsed !== null && procParsed >= 0
        ? procParsed
        : riProcedureAmount.trim() === ''
          ? 0
          : null;
    const roomTotal =
      rate !== null && Number.isFinite(daysNum) && daysNum >= 1 ? rate * daysNum : null;
    const grand =
      roomTotal !== null && procedureNum !== null ? roomTotal + procedureNum : null;
    return { roomTotal, procedureNum, grand };
  }, [riRoomRatePerDay, riDays, riProcedureAmount]);

  const positionOptions = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.position))).sort();
  }, [rows]);

  const departmentOptions = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.department))).sort();
  }, [rows]);

  const branchOptions = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.branch))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q);
      const matchesPosition = !positionFilter || r.position === positionFilter;
      const matchesDepartment = !departmentFilter || r.department === departmentFilter;
      const matchesBranch = !branchFilter || r.branch === branchFilter;
      return matchesSearch && matchesPosition && matchesDepartment && matchesBranch;
    });
  }, [rows, search, positionFilter, departmentFilter, branchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const dashboardSummary = useMemo(() => {
    const toNum = (v: string) => Number(v || '0');
    const totalUsers = filteredRows.length;

    const totalRawatJalanAllocated = filteredRows.reduce((acc, r) => acc + toNum(r.rawatJalan.allocated), 0);
    const totalRawatJalanSpent = filteredRows.reduce((acc, r) => acc + toNum(r.rawatJalan.spent), 0);
    const totalRawatJalanRemaining = filteredRows.reduce((acc, r) => acc + toNum(r.rawatJalan.remaining), 0);

    const totalRawatInapSpent = filteredRows.reduce((acc, r) => acc + toNum(r.rawatInap.spent), 0);
    const totalRawatInapAllocated = filteredRows.reduce((acc, r) => acc + toNum(r.rawatInap.allocated), 0);

    const totalMelahirkanRemaining = filteredRows.reduce(
      (acc, r) => acc + toNum(r.melahirkan?.remaining ?? '0'),
      0,
    );
    const totalMelahirkanSpent = filteredRows.reduce(
      (acc, r) => acc + toNum(r.melahirkan?.spent ?? '0'),
      0,
    );

    const totalSpend = totalRawatJalanSpent + totalRawatInapSpent + totalMelahirkanSpent;
    const totalBudgetHighlight =
      totalRawatJalanAllocated + totalRawatInapAllocated + totalMelahirkanRemaining + totalMelahirkanSpent;

    return {
      totalUsers,
      totalRawatJalanRemaining,
      totalRawatInapSpent,
      totalMelahirkanRemaining,
      totalSpend,
      totalBudgetHighlight,
    };
  }, [filteredRows]);

  async function load() {
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
      const message = e instanceof Error ? e.message : 'Gagal memuat budget user';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    setPage(1);
  }, [search, positionFilter, departmentFilter, branchFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openSpendModal(userId: string) {
    setActiveUserId(userId);
    setSpendInput('');
    setModalError(null);
    setBenefitType('RAWAT_JALAN');
    setRawatJalanMedicalId('');
    setRawatInapEpisodes([]);
    setRawatInapEpisodeOptionId('');
    setRawatInapEpisodeOptions([]);
    setRiRoomRatePerDay('');
    setRiDays('1');
    setRiIsOperasi(false);
    setRiProcedureAmount('');
    setSpendDocumentFile(null);
    setSpendDocumentMeta(null);
    setModalOpen(true);
  }

  async function loadModalLookups(userId: string) {
    try {
      const [medRes, epRes, optionRes] = await Promise.all([
        listRawatJalanMedicals(true),
        listRawatInapEpisodes(userId, year),
        listRawatInapEpisodeOptions(true),
      ]);
      if (medRes.success) {
        setRawatJalanMedicals(medRes.data ?? []);
        setRawatJalanMedicalId((prev) => prev || (medRes.data?.[0]?.id ?? ''));
      }
      if (epRes.success) {
        setRawatInapEpisodes(epRes.data ?? []);
      }
      if (optionRes.success) {
        setRawatInapEpisodeOptions(optionRes.data ?? []);
        setRawatInapEpisodeOptionId((prev) => prev || (optionRes.data?.[0]?.id ?? ''));
      }
    } catch {
      // ignore: modal will still work (admin can retry)
    }
  }

  useEffect(() => {
    if (!modalOpen || !activeUserId) return;
    void loadModalLookups(activeUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, activeUserId, year]);

  async function confirmSpend() {
    if (!activeUserId) return;

    if (benefitType === 'RAWAT_JALAN' && !rawatJalanMedicalId) {
      setModalError('Pilih medical Rawat Jalan');
      return;
    }
    if (benefitType === 'RAWAT_INAP' && !rawatInapEpisodeOptionId) {
      setModalError('Pilih jenis episode Rawat Inap');
      return;
    }

    if (benefitType === 'RAWAT_INAP') {
      const roomRate = parseRupiah(riRoomRatePerDay);
      const daysNum = Math.floor(Number(riDays));
      const proc = parseRupiah(riProcedureAmount);
      if (roomRate === null || roomRate < 0) {
        setModalError('Tarif kamar per hari tidak valid');
        return;
      }
      if (!Number.isFinite(daysNum) || daysNum < 1) {
        setModalError('Lama menginap (hari) minimal 1');
        return;
      }
      if (proc === null || proc < 0) {
        setModalError('Nominal operasi/tanpa operasi tidak valid');
        return;
      }
      const roomTotal = roomRate * daysNum;
      if (roomTotal <= 0 && proc <= 0) {
        setModalError('Minimal salah satu: total kamar atau nominal tindakan harus lebih dari 0');
        return;
      }
    } else {
      const amountNumber = parseRupiah(spendInput);
      if (amountNumber === null || amountNumber <= 0) {
        setModalError('amount harus angka lebih dari 0');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setModalError(null);
    try {
      let documentPayload: {
        documentUrl?: string;
        documentPublicId?: string;
        documentOriginalName?: string;
      } = {};
      if (spendDocumentFile) {
        setSpendDocumentUploading(true);
        const uploadRes = await uploadSpendDocument(spendDocumentFile);
        setSpendDocumentUploading(false);
        if (!uploadRes.success) {
          setModalError(uploadRes.message);
          return;
        }
        setSpendDocumentMeta(uploadRes.data);
        documentPayload = {
          documentUrl: uploadRes.data.url,
          documentPublicId: uploadRes.data.publicId,
          documentOriginalName: uploadRes.data.originalName,
        };
      }
      const res =
        benefitType === 'RAWAT_INAP'
          ? await adminSpendForUser({
              userId: activeUserId,
              year,
              // fallback supaya endpoint lama yang masih cek amount tetap lolos
              amount: rawatInapComputed.grand ?? 0,
              note: 'Admin add spend',
              benefitType: 'RAWAT_INAP',
              rawatInapEpisodeOptionId,
              ...documentPayload,
              rawatInapDetail: {
                roomRatePerDay: parseRupiah(riRoomRatePerDay) ?? 0,
                days: Math.floor(Number(riDays)),
                isOperasi: riIsOperasi,
                procedureAmount: parseRupiah(riProcedureAmount) ?? 0,
              },
            })
          : await adminSpendForUser({
              userId: activeUserId,
              year,
              amount: parseRupiah(spendInput) as number,
              note: 'Admin add spend',
              benefitType,
              rawatJalanMedicalId: benefitType === 'RAWAT_JALAN' ? rawatJalanMedicalId : undefined,
              ...documentPayload,
            });
      if (!res.success) {
        setModalError(res.message);
        toast.error('Gagal menambah spend', {
          description: res.message,
        });
        return;
      }

      toast.success('Add spend berhasil', {
        description: `Transaksi spend untuk year ${year} berhasil disimpan.`,
      });
      setModalOpen(false);
      setActiveUserId(null);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menambah spend';
      setModalError(message);
      toast.error('Gagal menambah spend', {
        description: message,
      });
    } finally {
      setSpendDocumentUploading(false);
      setLoading(false);
    }
  }

  async function resetUserTransactions(userId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResetUserTransactions({ userId, year });
      if (!res.success) {
        setError(res.message);
        toast.error('Gagal reset transaksi', {
          description: res.message,
        });
        return;
      }
      toast.success('Reset transaksi berhasil', {
        description: `Transaksi user untuk year ${year} sudah direset.`,
      });
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal reset transaksi user';
      setError(message);
      toast.error('Gagal reset transaksi', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-right" richColors closeButton />
      {error ? <Alert title="Error" message={error} /> : null}

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
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
                  ? 'rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800'
                  : 'rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100'
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
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{dashboardSummary.totalUsers}</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Sesuai filter aktif</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total Spend</div>
          <div className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">
            {formatRupiah(dashboardSummary.totalSpend)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Semua benefit</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Budget Highlight</div>
          <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {formatRupiah(dashboardSummary.totalBudgetHighlight)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Akumulasi budget terpantau</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">RJ Remaining</div>
          <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatRupiah(dashboardSummary.totalRawatJalanRemaining)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Rawat Jalan</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">RI Total Spend</div>
          <div className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">
            {formatRupiah(dashboardSummary.totalRawatInapSpent)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Rawat Inap</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Melahirkan Remaining</div>
          <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatRupiah(dashboardSummary.totalMelahirkanRemaining)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Female only pool</div>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <div className="grid min-w-[1520px] grid-cols-[300px_210px_190px_180px_220px_220px_220px_260px] items-center gap-0 border-b border-zinc-200 bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <div className="whitespace-nowrap">User</div>
          <div className="flex justify-start whitespace-nowrap">Departemen</div>
          <div className="whitespace-nowrap">Position</div>
          <div className="whitespace-nowrap">Branch</div>
          <div className="flex justify-end whitespace-nowrap">Rawat Jalan (Remaining)</div>
          <div className="flex justify-end whitespace-nowrap">Rawat Inap (Total Spend)</div>
          <div className="flex justify-end whitespace-nowrap">Melahirkan (Remaining)</div>
          <div className="flex justify-center whitespace-nowrap">Actions</div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {pagedRows.length === 0 && !loading ? (
            <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">
              Tidak ada data yang cocok untuk filter saat ini.
            </div>
          ) : null}

          {pagedRows.map((r) => (
            <div
              key={r.userId}
            className="grid min-w-[1520px] grid-cols-[300px_210px_190px_180px_220px_220px_220px_260px] items-center gap-0 px-5 py-2.5"
            >
              <div className="min-w-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <div className="truncate">
                  {r.firstName} {r.lastName}
                </div>
                <div
                  className="mt-1 truncate text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400"
                  title={r.userId}
                >
                  {formatUserId(r.userId)}
                </div>
              </div>

              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                <div className="flex justify-start pr-2 whitespace-nowrap">{r.department}</div>
              </div>

              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                {formatPositionLabel(r.position)}
              </div>

              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                {formatBranchLabel(r.branch)}
              </div>

              <div className="flex justify-end text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                {formatRupiah(r.rawatJalan.remaining)}
              </div>
              <div className="flex justify-end text-sm font-semibold tabular-nums text-rose-700 dark:text-rose-300">
                {formatRupiah(r.rawatInap.spent)}
              </div>
              <div className="flex justify-end text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                {r.melahirkan ? formatRupiah(r.melahirkan.remaining) : '-'}
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setResetTargetUserId(r.userId)}
                  disabled={loading}
                  className="h-8 min-w-[82px] px-2.5 py-1 text-xs"
                >
                  Reset Txn
                </Button>
                <Button
                  type="button"
                  onClick={() => openSpendModal(r.userId)}
                  disabled={loading}
                  className="h-8 min-w-[82px] px-2.5 py-1 text-xs"
                >
                  Add Spend
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {pagedRows.length === 0 && !loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Tidak ada data yang cocok untuk filter saat ini.
          </div>
        ) : null}
        {pagedRows.map((r) => (
          <div
            key={r.userId}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {r.firstName} {r.lastName}
              </div>
              <div className="mt-1 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">{formatUserId(r.userId)}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Departemen</div>
                <div className="font-medium text-zinc-800 dark:text-zinc-200">{r.department}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Position</div>
                <div className="font-medium text-zinc-800 dark:text-zinc-200">{formatPositionLabel(r.position)}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Branch</div>
                <div className="font-medium text-zinc-800 dark:text-zinc-200">{formatBranchLabel(r.branch)}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Rawat Jalan</div>
                <div className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {formatRupiah(r.rawatJalan.remaining)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Rawat Inap Spend</div>
                <div className="font-semibold tabular-nums text-rose-700 dark:text-rose-300">
                  {formatRupiah(r.rawatInap.spent)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Melahirkan</div>
                <div className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {r.melahirkan ? formatRupiah(r.melahirkan.remaining) : '-'}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setResetTargetUserId(r.userId)}
                disabled={loading}
                className="h-9 flex-1 px-3 py-1.5"
              >
                Reset Txn
              </Button>
              <Button
                type="button"
                onClick={() => openSpendModal(r.userId)}
                disabled={loading}
                className="h-9 flex-1 px-3 py-1.5"
              >
                Add Spend
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredRows.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Page {page} / {totalPages} ({filteredRows.length} users)
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3 text-xs"
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Add Spend
                </div>
                <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {(() => {
                    const u = rows.find((x) => x.userId === activeUserId);
                    if (!u) return '';
                    return `${u.firstName} ${u.lastName}`;
                  })()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setActiveUserId(null);
                  setSpendInput('');
                  setModalError(null);
                  setSpendDocumentFile(null);
                  setSpendDocumentMeta(null);
                }}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {modalError ? <Alert title="Error" message={modalError} /> : null}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Benefit Type
                </label>
                <select
                  value={benefitType}
                  onChange={(e) => setBenefitType(e.target.value as BenefitType)}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                >
                  <option value="RAWAT_JALAN">Rawat Jalan</option>
                  <option value="RAWAT_INAP">Rawat Inap</option>
                  <option value="MELAHIRKAN">Melahirkan</option>
                </select>
              </div>

              {benefitType === 'RAWAT_JALAN' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Rawat Jalan Medical
                  </label>
                  <select
                    value={rawatJalanMedicalId}
                    onChange={(e) => setRawatJalanMedicalId(e.target.value)}
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                  >
                    {rawatJalanMedicals.length === 0 ? (
                      <option value="">(Belum ada medical)</option>
                    ) : null}
                    {rawatJalanMedicals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {benefitType === 'RAWAT_INAP' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      Jenis episode
                    </label>
                    <select
                      value={rawatInapEpisodeOptionId}
                      onChange={(e) => setRawatInapEpisodeOptionId(e.target.value)}
                      disabled={loading}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                    >
                      {rawatInapEpisodeOptions.length === 0 ? (
                        <option value="">(Belum ada jenis episode)</option>
                      ) : null}
                      {rawatInapEpisodeOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    {rawatInapEpisodes.length === 0 ? (
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Belum ada episode untuk user ini, episode akan dibuat otomatis saat save.
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        Tarif kamar per hari
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={riRoomRatePerDay}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (!next.trim()) {
                            setRiRoomRatePerDay('');
                            return;
                          }
                          const parsed = parseRupiah(next);
                          if (parsed === null) return;
                          setRiRoomRatePerDay(formatRupiah(parsed, { maximumFractionDigits: 0 }));
                        }}
                        disabled={loading}
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                        placeholder="contoh: 450000"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        Lama menginap (hari)
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={riDays}
                        onChange={(e) => setRiDays(e.target.value)}
                        disabled={loading}
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Tindakan</span>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-700 dark:text-zinc-200">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="ri-operasi"
                          checked={!riIsOperasi}
                          onChange={() => setRiIsOperasi(false)}
                          disabled={loading}
                        />
                        Tanpa operasi
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="ri-operasi"
                          checked={riIsOperasi}
                          onChange={() => setRiIsOperasi(true)}
                          disabled={loading}
                        />
                        Operasi
                      </label>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {riIsOperasi ? 'Nominal operasi' : 'Nominal tanpa operasi'}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={riProcedureAmount}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (!next.trim()) {
                            setRiProcedureAmount('');
                            return;
                          }
                          const parsed = parseRupiah(next);
                          if (parsed === null) return;
                          setRiProcedureAmount(formatRupiah(parsed, { maximumFractionDigits: 0 }));
                        }}
                        disabled={loading}
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                        placeholder="contoh: 8000000"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                    <div className="flex justify-between gap-2">
                      <span>Total kamar (tarif × hari)</span>
                      <span>
                        {rawatInapComputed.roomTotal !== null
                          ? formatRupiah(rawatInapComputed.roomTotal, { maximumFractionDigits: 0 })
                          : '—'}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between gap-2">
                      <span>{riIsOperasi ? 'Nominal operasi' : 'Nominal tanpa operasi'}</span>
                      <span>
                        {rawatInapComputed.procedureNum !== null
                          ? formatRupiah(rawatInapComputed.procedureNum, { maximumFractionDigits: 0 })
                          : '—'}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 border-t border-zinc-200 pt-2 text-base dark:border-zinc-600">
                      <span>Total dipotong</span>
                      <span>
                        {rawatInapComputed.grand !== null
                          ? formatRupiah(rawatInapComputed.grand, { maximumFractionDigits: 0 })
                          : '—'}
                      </span>
                    </div>
                  </div>

                </div>
              ) : null}

              {benefitType !== 'RAWAT_INAP' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Amount
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={spendInput}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (!next.trim()) {
                        setSpendInput('');
                        return;
                      }

                      const parsed = parseRupiah(next);
                      if (parsed === null) return;

                      setSpendInput(formatRupiah(parsed, { maximumFractionDigits: 0 }));
                    }}
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                    placeholder="contoh: 250000"
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Dokumen pendukung (opsional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={loading || spendDocumentUploading}
                  onChange={(e) => setSpendDocumentFile(e.target.files?.[0] ?? null)}
                  className="block w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
                />
                {spendDocumentFile ? (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    File: <span className="font-semibold">{spendDocumentFile.name}</span>
                  </div>
                ) : null}
                {spendDocumentMeta ? (
                  <a
                    href={spendDocumentMeta.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Dokumen terakhir ter-upload
                  </a>
                ) : null}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Year: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{year}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setModalOpen(false);
                      setActiveUserId(null);
                      setSpendInput('');
                      setModalError(null);
                      setSpendDocumentFile(null);
                      setSpendDocumentMeta(null);
                    }}
                    disabled={loading || spendDocumentUploading}
                    className="h-11 min-w-[120px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void confirmSpend()}
                    disabled={loading || spendDocumentUploading}
                    className="h-11 min-w-[120px]"
                  >
                    {loading || spendDocumentUploading ? 'Simpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog.Root open={Boolean(resetTargetUserId)} onOpenChange={(open) => !open && setResetTargetUserId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-60 bg-black/50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-61 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <AlertDialog.Title className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Konfirmasi Reset Transaksi
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Semua transaksi user pada year <span className="font-semibold">{year}</span> akan dihapus dan nilai spent
              akan direset ke 0.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="secondary" className="h-9 px-3 text-xs">
                  Batal
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  type="button"
                  className="h-9 px-3 text-xs"
                  onClick={() => {
                    if (!resetTargetUserId) return;
                    const target = resetTargetUserId;
                    setResetTargetUserId(null);
                    void resetUserTransactions(target);
                  }}
                >
                  Ya, Reset
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

