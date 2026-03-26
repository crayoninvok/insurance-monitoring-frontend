'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createRawatInapEpisodeOption,
  listRawatInapEpisodeOptions,
  setRawatInapEpisodeOptionActive,
} from '../../services/budget.services';
import type { RawatInapEpisodeOption } from '../../types/types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

type RawatInapEpisodeOptionsManagerProps = {
  variant?: 'default' | 'modal';
};

export function RawatInapEpisodeOptionsManager({ variant = 'default' }: RawatInapEpisodeOptionsManagerProps) {
  const PAGE_SIZE = 6;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RawatInapEpisodeOption[]>([]);
  const [name, setName] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);

  const visibleItems = useMemo(() => {
    return showInactive ? items : items.filter((x) => x.isActive);
  }, [items, showInactive]);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visibleItems.slice(start, start + PAGE_SIZE);
  }, [visibleItems, page]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listRawatInapEpisodeOptions(!showInactive);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setItems(res.data ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal memuat opsi episode Rawat Inap';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function onAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nama episode wajib diisi');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createRawatInapEpisodeOption({ name: trimmed });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setName('');
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal menambah opsi episode';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, next: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await setRawatInapEpisodeOptionActive(id, { isActive: next });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setItems((prev) => prev.map((x) => (x.id === id ? res.data : x)));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal mengubah status opsi episode';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const isModal = variant === 'modal';

  return (
    <div className={isModal ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
      {error ? <Alert title="Error" message={error} /> : null}

      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Rawat Inap Episode Options
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Admin mendefinisikan pilihan episode; semua user memilih dari daftar ini saat membuat episode baru.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="flex min-w-0 flex-col gap-1">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Tambah Episode</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="h-11 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
            placeholder="contoh: Demam berdarah"
          />
        </div>
        <Button type="button" onClick={() => void onAdd()} disabled={loading} className="h-11 w-full min-w-0 sm:min-w-[140px] sm:w-auto">
          {loading ? 'Menyimpan...' : 'Tambah'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            disabled={loading}
          />
          Tampilkan inactive
        </label>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Refresh
        </button>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {!isModal ? (
          <div className="hidden md:block">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,100px)_minmax(0,100px)] gap-1 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:gap-0 sm:px-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <div className="min-w-0">Nama</div>
              <div className="text-center">Status</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {pagedItems.length === 0 && !loading ? (
                <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">Belum ada opsi episode.</div>
              ) : null}

              {pagedItems.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,100px)_minmax(0,100px)] items-center gap-1 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:gap-0 sm:px-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{m.name}</div>
                  </div>
                  <div className="text-center text-sm font-semibold">
                    {m.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800 sm:px-3 sm:text-xs dark:bg-emerald-900/40 dark:text-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-700 sm:px-3 sm:text-xs dark:bg-zinc-800 dark:text-zinc-200">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={() => void toggleActive(m.id, !m.isActive)}
                      className="h-9 min-w-0 px-2 text-xs sm:h-10 sm:min-w-[120px] sm:px-4 sm:text-sm"
                    >
                      {m.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={isModal ? 'block' : 'md:hidden'}>
          <div className="flex flex-col gap-2 p-3">
            {pagedItems.length === 0 && !loading ? (
              <div className="p-2 text-sm text-zinc-600 dark:text-zinc-400">Belum ada opsi episode.</div>
            ) : null}

            {pagedItems.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{m.name}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">
                    {m.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        Inactive
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={loading}
                    onClick={() => void toggleActive(m.id, !m.isActive)}
                    className="h-9 shrink-0"
                  >
                    {m.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {visibleItems.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Page {page} / {totalPages} ({visibleItems.length} items)
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs"
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
