import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-14">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
              Monitoring Budget Insurance
            </h1>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Kelola alokasi dan pemakaian budget asuransi berdasarkan{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Position
              </span>
              . Budget otomatis terpisah per tahun sehingga “reset” terjadi
              natural saat memasuki tahun baru.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Mulai login
              </Link>
              <a
                href="http://localhost:8000/health"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Cek backend
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Feature
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Budget policy per Position & Year
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Admin menetapkan nominal tahunan untuk tiap Position.
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Feature
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  My budget (saldo)
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  User melihat allocated, spent, dan remaining untuk tahun
                  berjalan.
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  QA notes
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Endpoint admin dilindungi JWT dan role <span className="font-semibold">ADMIN</span>.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
