'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  actionLabel?: string;
  onAction: () => void;
  actionVariant?: 'danger' | 'primary';
  children?: ReactNode;
};

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Batal',
  actionLabel = 'Lanjutkan',
  onAction,
  actionVariant = 'primary',
  children,
}: AlertDialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="alert-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {description ? (
          <p id="alert-dialog-description" className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
        {children}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onAction}
            className={[
              'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white',
              actionVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400'
                : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200',
            ].join(' ')}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
