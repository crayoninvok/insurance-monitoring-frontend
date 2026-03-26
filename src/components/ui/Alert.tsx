export function Alert({
  title,
  message,
  variant = 'error',
}: {
  title?: string;
  message: string;
  variant?: 'error' | 'info' | 'success';
}) {
  const styles =
    variant === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
      : variant === 'info'
        ? 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200'
        : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200';

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      {title ? <div className="mb-1 font-semibold">{title}</div> : null}
      <div className="opacity-90">{message}</div>
    </div>
  );
}

