 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';

export default function Home() {
  const heroImages = ['/4.jpg', '/3.JPG', '/1.JPG', '/2.JPG'];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_50px_-20px_rgba(15,23,42,0.25)] dark:border-zinc-800 dark:bg-zinc-950">
          <div className="absolute inset-0">
            {heroImages.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                className={[
                  'object-cover object-center transition-opacity duration-700',
                  index === activeImageIndex ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                priority={index === 0}
                sizes="100vw"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950/88 via-zinc-900/66 to-zinc-900/20 dark:from-zinc-950/90 dark:via-zinc-900/70 dark:to-zinc-900/25" />

          <div className="relative grid min-h-[460px] items-end p-6 sm:p-10">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur">
                Insurance Dashboard
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Budget terkontrol, keputusan lebih tenang.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                Satu tempat untuk melihat alokasi, pemakaian, dan sisa budget.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="/budget"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Lihat Budget
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            Policy per posisi
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            Monitoring real-time
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            Akses aman per role
          </div>
        </section>
      </main>
    </div>
  );
}
