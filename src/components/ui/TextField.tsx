'use client';

import { useRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export function TextField({
  label,
  error,
  className = '',
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
}) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  const inputRef = useRef<HTMLInputElement>(null);

  function shouldForceIosKeyboard() {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return isIos && standalone;
  }

  function forceFocusForIosPwa() {
    const el = inputRef.current;
    if (!el) return;

    // Workaround for iOS PWA where tap focuses input but keyboard sometimes doesn't open.
    window.setTimeout(() => {
      el.focus();
      el.click();
    }, 0);
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base text-zinc-900 outline-none transition focus:border-zinc-400 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
        onTouchStart={(e) => {
          props.onTouchStart?.(e);
          if (e.defaultPrevented) return;
          if (shouldForceIosKeyboard()) forceFocusForIosPwa();
        }}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

