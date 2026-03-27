import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <Image
              src="/logobdp.png"
              alt="Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="min-w-0 flex flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Insurance BDP Monitoring App
            </span>
            <span className="text-xs italic text-zinc-500 dark:text-zinc-400">
              property of www.bataramining.com
            </span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}