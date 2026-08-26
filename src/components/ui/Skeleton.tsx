'use client';

import type { HTMLAttributes } from 'react';

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70 ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ className = 'h-4 w-24' }: { className?: string }) {
  return <Skeleton className={`my-1 ${className}`} />;
}

export function SkeletonCard({ className = 'h-32 w-full' }: { className?: string }) {
  return <Skeleton className={`rounded-3xl ${className}`} />;
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 pr-4">
          <Skeleton className="h-4 w-full rounded-md" />
        </td>
      ))}
    </tr>
  );
}
