export function formatRupiah(
  value: number | string | null | undefined,
  opts?: { maximumFractionDigits?: number },
) {
  if (value === null || value === undefined) return '-';

  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return '-';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
  }).format(n);
}

// Parse angka input dengan format rupiah Indonesia (contoh: 1.500.000,50)
// Mengembalikan number, atau null kalau tidak bisa diparse.
export function parseRupiah(input: string): number | null {
  if (!input) return null;

  const normalized = input
    .replace(/rp/i, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();

  if (!normalized) return null;

  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

