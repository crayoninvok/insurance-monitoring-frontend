import type { ReactNode } from 'react';

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_-12px_rgba(15,23,42,0.12)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_12px_40px_-12px_rgba(0,0,0,0.45)]">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

