'use client';

import { useEffect, useState } from 'react';
import {
  adminUpdateLedgerEntry,
  listRawatJalanMedicals,
  uploadSpendDocument,
} from '../../services/budget.services';
import type { AdminUserLedgerEntry } from '../../types/types';
import { parseRupiah } from '../../utils/amount';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

const selectClass =
  'h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600';

type AdminLedgerEntryEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AdminUserLedgerEntry | null;
  onSaved: (updated: AdminUserLedgerEntry) => void;
};

export function AdminLedgerEntryEditModal({
  open,
  onOpenChange,
  entry,
  onSaved,
}: AdminLedgerEntryEditModalProps) {
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');
  const [medicalId, setMedicalId] = useState('');
  const [medicals, setMedicals] = useState<{ id: string; name: string }[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentMeta, setDocumentMeta] = useState<{
    url: string;
    publicId: string;
    originalName: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRjSpend =
    entry?.type === 'SPEND' && entry.benefitType === 'RAWAT_JALAN';

  useEffect(() => {
    if (!open || !entry) return;

    setAmountInput(entry.amount);
    setNote(entry.note ?? '');
    setMedicalId(entry.rawatJalanMedical?.id ?? '');
    setDocumentFile(null);
    setDocumentMeta(
      entry.documentUrl
        ? {
            url: entry.documentUrl,
            publicId: entry.documentPublicId ?? '',
            originalName: entry.documentOriginalName ?? 'Dokumen',
          }
        : null,
    );
    setError(null);
  }, [open, entry]);

  useEffect(() => {
    if (!open || !isRjSpend) return;
    void listRawatJalanMedicals(true).then((res) => {
      if (res.success && res.data) {
        setMedicals(res.data.map((m) => ({ id: m.id, name: m.name })));
      }
    });
  }, [open, isRjSpend]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open || !entry) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;
    setSaving(true);
    setError(null);

    try {
      const amount = parseRupiah(amountInput);
      if (amount === null || amount <= 0) {
        setError('Amount harus lebih dari 0');
        return;
      }

      let docPayload:
        | {
            documentUrl: string | null;
            documentPublicId: string | null;
            documentOriginalName: string | null;
          }
        | undefined;

      if (documentFile) {
        const uploadRes = await uploadSpendDocument(documentFile);
        if (!uploadRes.success) {
          setError(
            'message' in uploadRes ? uploadRes.message : 'Gagal upload dokumen',
          );
          return;
        }
        if (!uploadRes.data) {
          setError('Gagal upload dokumen');
          return;
        }
        docPayload = {
          documentUrl: uploadRes.data.url,
          documentPublicId: uploadRes.data.publicId,
          documentOriginalName: uploadRes.data.originalName,
        };
      }

      const res = await adminUpdateLedgerEntry(entry.id, {
        amount,
        note: note.trim() || null,
        ...(isRjSpend ? { rawatJalanMedicalId: medicalId } : {}),
        ...(docPayload ?? {}),
      });

      if (!res.success) {
        setError(
          'message' in res ? res.message : 'Gagal menyimpan perubahan',
        );
        return;
      }
      if (!res.data) {
        setError('Gagal menyimpan perubahan');
        return;
      }

      onSaved(res.data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Edit transaksi ledger
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {entry.type} · {entry.benefitType ?? entry.spendCategory ?? '-'}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <TextField
            label="Amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="Contoh: 1500000"
            disabled={saving}
            inputMode="decimal"
          />

          <TextField
            label="Catatan"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={saving}
          />

          {isRjSpend ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Medical Rawat Jalan
              </label>
              <select
                className={selectClass}
                value={medicalId}
                onChange={(e) => setMedicalId(e.target.value)}
                disabled={saving}
              >
                <option value="">Pilih medical</option>
                {medicals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {entry.type === 'SPEND' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Dokumen pendukung (opsional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={saving}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-800 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100"
                onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
              />
              {documentMeta ? (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Dokumen saat ini:{' '}
                  <a
                    href={documentMeta.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {documentMeta.originalName}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <Button
            type="button"
            variant="secondary"
            className="h-10"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" className="h-10 min-w-[120px]" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
