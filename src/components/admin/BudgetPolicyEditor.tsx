'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  listMelahirkanPolicies,
  listRawatInapPolicies,
  listRawatJalanPolicies,
  upsertMelahirkanPolicy,
  upsertRawatInapPolicy,
  upsertRawatJalanPolicy,
} from '../../services/budget.services';
import type {
  Position,
  RawatInapPolicy,
  RawatInapServiceType,
  UpsertMelahirkanPolicyRequest,
  UpsertRawatInapPolicyRequest,
  UpsertRawatJalanPolicyRequest,
} from '../../types/types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { RawatInapEpisodeOptionsManager } from './RawatInapEpisodeOptionsManager';
import { RawatJalanMedicalManager } from './RawatJalanMedicalManager';
import { POSITION_LABEL } from '../../constants/positionLabels';

type AmountMap = Partial<Record<Position, string>>;
type InapCapsMap = Partial<Record<Position, Partial<Record<RawatInapServiceType, string>>>>;

const ALL_POSITIONS: Position[] = [
  'DIRECTOR',
  'MANAGER',
  'SUPERINTENDENT',
  'SUPERVISOR',
  'JUNIOR_SUPERVISOR',
  'WORKER',
];

const INAP_TYPES: RawatInapServiceType[] = ['TARIF_KAMAR_DAYS', 'TANPA_OPERASI', 'OPERASI'];

const INAP_LABEL: Record<RawatInapServiceType, string> = {
  TARIF_KAMAR_DAYS: 'Tarif Kamar / Days',
  TANPA_OPERASI: 'Tanpa Operasi',
  OPERASI: 'Operasi',
};

export function BudgetPolicyEditor() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rawatJalanAmounts, setRawatJalanAmounts] = useState<AmountMap>({});
  const [melahirkanAmounts, setMelahirkanAmounts] = useState<AmountMap>({});
  const [rawatInapCaps, setRawatInapCaps] = useState<InapCapsMap>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<'RAWAT_JALAN' | 'RAWAT_INAP' | 'MELAHIRKAN' | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    // 3 tahun ke belakang + tahun sekarang + 2 tahun ke depan
    return [current - 3, current - 2, current - 1, current, current + 1, current + 2];
  }, []);

  async function loadPolicies(nextYear: number) {
    setLoading(true);
    setError(null);
    try {
      const [rjRes, melRes, inapRes] = await Promise.all([
        listRawatJalanPolicies(nextYear),
        listMelahirkanPolicies(nextYear),
        listRawatInapPolicies(nextYear),
      ]);

      if (!rjRes.success) return void setError(rjRes.message);
      if (!melRes.success) return void setError(melRes.message);
      if (!inapRes.success) return void setError(inapRes.message);

      const rjMap: AmountMap = {};
      for (const p of rjRes.data ?? []) rjMap[p.position] = p.annualAmount;
      setRawatJalanAmounts(rjMap);

      const melMap: AmountMap = {};
      for (const p of melRes.data ?? []) melMap[p.position] = p.annualAmount;
      setMelahirkanAmounts(melMap);

      const inapMap: InapCapsMap = {};
      for (const p of (inapRes.data ?? []) as RawatInapPolicy[]) {
        inapMap[p.position] = inapMap[p.position] ?? {};
        inapMap[p.position]![p.serviceType] = p.capAmount;
      }
      setRawatInapCaps(inapMap);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal memuat policies';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPolicies(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  function openCard(card: 'RAWAT_JALAN' | 'RAWAT_INAP' | 'MELAHIRKAN') {
    setActiveCard(card);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setActiveCard(null);
    setError(null);
  }

  async function saveRawatJalan() {
    setLoading(true);
    setError(null);
    try {
      const rjRequests: UpsertRawatJalanPolicyRequest[] = ALL_POSITIONS.map((position) => {
        const raw = rawatJalanAmounts[position];
        return raw === undefined || raw === '' ? null : { year, position, annualAmount: raw };
      }).filter(Boolean) as UpsertRawatJalanPolicyRequest[];

      if (rjRequests.length === 0) {
        setError('Tidak ada policy Rawat Jalan yang diisi');
        return;
      }
      await Promise.all(rjRequests.map((r) => upsertRawatJalanPolicy(r)));
      await loadPolicies(year);
      closeModal();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menyimpan policy Rawat Jalan';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveMelahirkan() {
    setLoading(true);
    setError(null);
    try {
      const melRequests: UpsertMelahirkanPolicyRequest[] = ALL_POSITIONS.map((position) => {
        const raw = melahirkanAmounts[position];
        return raw === undefined || raw === '' ? null : { year, position, annualAmount: raw };
      }).filter(Boolean) as UpsertMelahirkanPolicyRequest[];

      if (melRequests.length === 0) {
        setError('Tidak ada policy Melahirkan yang diisi');
        return;
      }
      await Promise.all(melRequests.map((r) => upsertMelahirkanPolicy(r)));
      await loadPolicies(year);
      closeModal();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menyimpan policy Melahirkan';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveRawatInap() {
    setLoading(true);
    setError(null);
    try {
      const inapRequests: UpsertRawatInapPolicyRequest[] = [];
      for (const position of ALL_POSITIONS) {
        for (const st of INAP_TYPES) {
          const raw = rawatInapCaps[position]?.[st];
          if (raw === undefined || raw === '') continue;
          inapRequests.push({ year, position, serviceType: st, capAmount: raw });
        }
      }

      if (inapRequests.length === 0) {
        setError('Tidak ada policy Rawat Inap yang diisi');
        return;
      }
      await Promise.all(inapRequests.map((r) => upsertRawatInapPolicy(r)));
      await loadPolicies(year);
      closeModal();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menyimpan policy Rawat Inap';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setLoading(true);
    setError(null);
    try {
      const rjRequests: UpsertRawatJalanPolicyRequest[] = ALL_POSITIONS.map((position) => {
        const raw = rawatJalanAmounts[position];
        return raw === undefined || raw === '' ? null : { year, position, annualAmount: raw };
      }).filter(Boolean) as UpsertRawatJalanPolicyRequest[];

      const melRequests: UpsertMelahirkanPolicyRequest[] = ALL_POSITIONS.map((position) => {
        const raw = melahirkanAmounts[position];
        return raw === undefined || raw === '' ? null : { year, position, annualAmount: raw };
      }).filter(Boolean) as UpsertMelahirkanPolicyRequest[];

      const inapRequests: UpsertRawatInapPolicyRequest[] = [];
      for (const position of ALL_POSITIONS) {
        for (const st of INAP_TYPES) {
          const raw = rawatInapCaps[position]?.[st];
          if (raw === undefined || raw === '') continue;
          inapRequests.push({ year, position, serviceType: st, capAmount: raw });
        }
      }

      if (rjRequests.length + melRequests.length + inapRequests.length === 0) {
        setError('Tidak ada policy yang diisi');
        return;
      }

      await Promise.all([
        ...rjRequests.map((r) => upsertRawatJalanPolicy(r)),
        ...melRequests.map((r) => upsertMelahirkanPolicy(r)),
        ...inapRequests.map((r) => upsertRawatInapPolicy(r)),
      ]);
      await loadPolicies(year);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menyimpan policies';
      setError(message);
    } finally {
      setLoading(false);
    }
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => openCard('RAWAT_JALAN')}
          disabled={loading}
          className="group rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Rawat Jalan</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Annual pool per position + medical options
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Klik untuk edit</div>
            <div className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
              Open
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openCard('RAWAT_INAP')}
          disabled={loading}
          className="group rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Rawat Inap</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Caps per episode: kamar/days, tanpa operasi, operasi
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Klik untuk edit</div>
            <div className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
              Open
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openCard('MELAHIRKAN')}
          disabled={loading}
          className="group rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Melahirkan</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Female only annual pool per position
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Klik untuk edit</div>
            <div className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
              Open
            </div>
          </div>
        </button>
      </div>

      {modalOpen && activeCard && portalTarget
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden overflow-y-auto bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[min(92vh,100dvh)] w-full min-w-0 max-w-[min(100vw,42rem)] flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-xl sm:rounded-3xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-3 py-3 sm:px-5 sm:py-4 dark:border-zinc-800">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {activeCard === 'RAWAT_JALAN'
                    ? 'Edit Rawat Jalan'
                    : activeCard === 'RAWAT_INAP'
                      ? 'Edit Rawat Inap'
                      : 'Edit Melahirkan'}
                </div>
                <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Year: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{year}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex min-w-0 flex-col gap-4">
                {error ? <Alert title="Error" message={error} /> : null}

                {activeCard === 'RAWAT_JALAN' ? (
                  <div className="grid min-w-0 grid-cols-1 gap-4">
                    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Plafon Tahunan per Position
                      </div>
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Spend Rawat Jalan akan mengurangi pool ini.
                      </div>
                      <div className="mt-3 flex flex-col gap-3">
                        {ALL_POSITIONS.map((position) => (
                          <div
                            key={position}
                            className="flex min-w-0 flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:items-end sm:gap-3"
                          >
                            <div className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:w-40">
                              {POSITION_LABEL[position]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <TextField
                                label="Annual Amount"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={rawatJalanAmounts[position] ?? ''}
                                onChange={(e) =>
                                  setRawatJalanAmounts((prev) => ({
                                    ...prev,
                                    [position]: e.target.value,
                                  }))
                                }
                                placeholder="contoh: 1500000"
                                className="w-full min-w-0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <RawatJalanMedicalManager variant="modal" />
                    </div>
                  </div>
                ) : null}

              {activeCard === 'MELAHIRKAN' ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Plafon Tahunan per Position (Female Only)
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Hanya untuk user <span className="font-semibold">FEMALE</span>.
                  </div>
                  <div className="mt-3 grid gap-3">
                    {ALL_POSITIONS.map((position) => (
                      <div
                        key={position}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[220px_1fr] sm:items-center"
                      >
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {POSITION_LABEL[position]}
                        </div>
                        <TextField
                          label="Annual Amount"
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          value={melahirkanAmounts[position] ?? ''}
                          onChange={(e) =>
                            setMelahirkanAmounts((prev) => ({ ...prev, [position]: e.target.value }))
                          }
                          placeholder="contoh: 1500000"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeCard === 'RAWAT_INAP' ? (
                <div className="grid min-w-0 grid-cols-1 gap-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Caps per Episode (per Position)
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Limit berlaku <span className="font-semibold">per episode sakit</span> untuk 3 layanan.
                    </div>

                    <div className="mt-3 grid gap-4">
                      {ALL_POSITIONS.map((position) => (
                        <div
                          key={position}
                          className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {POSITION_LABEL[position]}
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            {INAP_TYPES.map((st) => (
                              <TextField
                                key={st}
                                label={INAP_LABEL[st]}
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={rawatInapCaps[position]?.[st] ?? ''}
                                onChange={(e) =>
                                  setRawatInapCaps((prev) => ({
                                    ...prev,
                                    [position]: { ...(prev[position] ?? {}), [st]: e.target.value },
                                  }))
                                }
                                placeholder="contoh: 450000"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <RawatInapEpisodeOptionsManager variant="modal" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

            <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4 dark:border-zinc-800">
              <Button type="button" variant="secondary" onClick={closeModal} disabled={loading} className="h-11 w-full min-w-0 sm:min-w-[140px] sm:w-auto">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (activeCard === 'RAWAT_JALAN') return void saveRawatJalan();
                  if (activeCard === 'RAWAT_INAP') return void saveRawatInap();
                  return void saveMelahirkan();
                }}
                disabled={loading}
                className="h-11 w-full min-w-0 sm:min-w-[180px] sm:w-auto"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>,
            portalTarget
          )
        : null}
    </div>
  );
}

