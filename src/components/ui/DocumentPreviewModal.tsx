'use client';

import { useEffect } from 'react';

type DocumentPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  fileLabel?: string | null;
};

export function DocumentPreviewModal({
  open,
  onOpenChange,
  url,
  fileLabel,
}: DocumentPreviewModalProps) {
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

  if (!open || !url) return null;

  const title = fileLabel?.trim() || 'Pratinjau dokumen';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Tutup pratinjau"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="document-preview-title"
            className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            title={title}
          >
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Buka di tab baru
            </a>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Tutup
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-zinc-100 dark:bg-zinc-900">
          <iframe
            key={url}
            title={title}
            src={url}
            className="h-[min(78vh,720px)] w-full border-0 sm:h-[min(80vh,760px)]"
          />
        </div>
      </div>
    </div>
  );
}
