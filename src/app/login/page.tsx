import Image from 'next/image';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { LoginForm } from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-zinc-50 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] dark:bg-zinc-950">
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/login-banner.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="(min-width: 1024px) 55vw, 0"
          />
        </div>
        {/* Overlay: darker at top & bottom for logo + footer; mid tone keeps headline readable */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/45 to-slate-950/88"
          aria-hidden
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-lg shadow-black/30 backdrop-blur-sm">
              <Image
                src="/logobdp.png"
                alt=""
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight drop-shadow-sm">Insurance BDP Monitoring App</p>
              <p className="text-sm text-white/80 drop-shadow-sm">Insurance</p>
            </div>
          </div>
          <h2 className="mt-14 max-w-md text-2xl font-semibold leading-snug tracking-tight text-white drop-shadow-md">
            Anggaran dan klaim asuransi karyawan, terpusat dan mudah dilacak.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 drop-shadow-sm">
            Masuk untuk melihat saldo, riwayat penggunaan, dan laporan sesuai hak akses Anda.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/65 drop-shadow-sm">
          Akses terbatas untuk pengguna terdaftar.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-4 w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <span aria-hidden>←</span>
            Kembali ke Home
          </Link>
        </div>
        <div className="mb-8 flex w-full max-w-md items-center gap-3 lg:hidden">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <Image src="/logobdp.png" alt="" fill className="object-contain p-0.5" priority />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Insurance BDP Monitoring App
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Insurance</p>
          </div>
        </div>

        <AuthCard
          title="Masuk"
          subtitle="Gunakan email dan password yang diberikan administrator."
        >
          <LoginForm redirectTo="/budget" />
        </AuthCard>
      </main>
    </div>
  );
}
