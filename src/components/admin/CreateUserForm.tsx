'use client';

import { useState } from 'react';
import { createUser } from '../../services/auth.services';
import { ApiError } from '../../services/api';
import type { Branch, Department, Gender, Position, Status } from '../../types/types';
import { BRANCH_LABEL } from '../../constants/branchLabels';
import { POSITION_LABEL } from '../../constants/positionLabels';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'HRGA', label: 'HRGA' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'PROCUREMENT', label: 'Procurement' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'PLANT', label: 'Plant' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'TRAINING_CENTER', label: 'Training Center' },
  { value: 'MANAGEMENT', label: 'Management' },
];

const BRANCHES: Branch[] = ['HEAD_OFFICE', 'SENYIUR', 'MUARA_PAHU'];

const POSITIONS: Position[] = [
  'DIRECTOR',
  'MANAGER',
  'SUPERINTENDENT',
  'SUPERVISOR',
  'JUNIOR_SUPERVISOR',
  'WORKER',
];

const selectClass =
  'h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600';

const BULK_TEMPLATE_HEADER = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'password',
  'gender',
  'department',
  'branch',
  'position',
  'status',
];

const BULK_TEMPLATE_SAMPLE = [
  'Budi',
  'Santoso',
  '081234567890',
  'budi.santoso@example.com',
  'Password123',
  'MALE',
  'HRGA',
  'HEAD_OFFICE',
  'WORKER',
  'ACTIVE',
];

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuote = !inQuote;
      }
      continue;
    }
    if (ch === ',' && !inQuote) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]);
  const indexMap = new Map(header.map((h, i) => [h.trim(), i]));
  return lines.slice(1).map((line, rowIdx) => {
    const cells = parseCsvLine(line);
    const get = (name: string) => cells[indexMap.get(name) ?? -1] ?? '';
    return {
      rowNumber: rowIdx + 2,
      firstName: get('firstName'),
      lastName: get('lastName'),
      phone: get('phone'),
      email: get('email'),
      password: get('password'),
      gender: get('gender').toUpperCase(),
      department: get('department').toUpperCase(),
      branch: get('branch').toUpperCase(),
      position: get('position').toUpperCase(),
      status: (get('status') || 'ACTIVE').toUpperCase(),
    };
  });
}

export function CreateUserForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [department, setDepartment] = useState<Department>('HRGA');
  const [branch, setBranch] = useState<Branch>('HEAD_OFFICE');
  const [position, setPosition] = useState<Position>('WORKER');
  const [status, setStatus] = useState<Status>('ACTIVE');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkRows, setBulkRows] = useState<Array<Record<string, string> & { rowNumber: number }>>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        gender,
        department,
        branch,
        position,
        status,
      });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setSuccess(`User dibuat: ${res.data.email} (${res.data.id})`);
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setGender('MALE');
      setDepartment('HRGA');
      setBranch('HEAD_OFFICE');
      setPosition('WORKER');
      setStatus('ACTIVE');
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Gagal membuat user');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    phone.trim() &&
    email.trim() &&
    password.length >= 6 &&
    !submitting;

  function downloadTemplate() {
    const csv = `${BULK_TEMPLATE_HEADER.join(',')}\n${BULK_TEMPLATE_SAMPLE.join(',')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_bulk_users.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onChooseCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setBulkError(null);
    setBulkResult(null);
    if (!file) {
      setBulkFileName('');
      setBulkRows([]);
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) {
        setBulkError('CSV kosong atau format tidak sesuai template');
        setBulkRows([]);
        setBulkFileName(file.name);
        return;
      }
      setBulkRows(rows);
      setBulkFileName(file.name);
    } catch (e2) {
      const message = e2 instanceof Error ? e2.message : 'Gagal membaca file CSV';
      setBulkError(message);
      setBulkRows([]);
      setBulkFileName(file.name);
    }
  }

  async function submitBulkUsers() {
    if (!bulkRows.length) {
      setBulkError('Pilih file CSV terlebih dahulu');
      return;
    }
    setBulkRunning(true);
    setBulkError(null);
    setBulkResult(null);
    let successCount = 0;
    const failed: string[] = [];
    for (const row of bulkRows) {
      try {
        const res = await createUser({
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          email: row.email,
          password: row.password,
          gender: row.gender as Gender,
          department: row.department as Department,
          branch: row.branch as Branch,
          position: row.position as Position,
          status: row.status as Status,
        });
        if (!res.success) {
          failed.push(`Baris ${row.rowNumber}: ${res.message}`);
        } else {
          successCount += 1;
        }
      } catch (e2) {
        const message = e2 instanceof Error ? e2.message : 'Unknown error';
        failed.push(`Baris ${row.rowNumber}: ${message}`);
      }
    }
    if (failed.length > 0) {
      setBulkError(failed.slice(0, 6).join(' | ') + (failed.length > 6 ? ' | ...' : ''));
    }
    setBulkResult(`Selesai upload bulk: berhasil ${successCount}, gagal ${failed.length}`);
    setBulkRunning(false);
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <form className="flex flex-col gap-5 rounded-3xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/60" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Buat user manual</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Isi form untuk menambahkan 1 user.</p>
        </div>
        {error ? <Alert title="Error" message={error} /> : null}
        {success ? <Alert title="Berhasil" message={success} variant="success" /> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nama depan" name="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={submitting} required />
          <TextField label="Nama belakang" name="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={submitting} required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Telepon" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submitting} required />
          <TextField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} required />
        </div>

        <TextField label="Password" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} required />
        <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">Minimal 6 karakter (disarankan lebih kuat untuk produksi).</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} disabled={submitting} className={selectClass}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} disabled={submitting} className={selectClass}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Departemen</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} disabled={submitting} className={selectClass}>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Branch</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value as Branch)} disabled={submitting} className={selectClass}>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {BRANCH_LABEL[b]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value as Position)} disabled={submitting} className={selectClass}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABEL[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          User baru selalu dibuat dengan role <span className="font-semibold text-zinc-900 dark:text-zinc-100">USER</span>.
          Hanya admin yang bisa memanggil endpoint ini.
        </div>

        <Button type="submit" disabled={!canSubmit} className="h-11 w-full sm:w-auto sm:min-w-[200px]">
          {submitting ? 'Menyimpan...' : 'Buat user'}
        </Button>
      </form>

      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Bulk upload via CSV</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Upload banyak user sekaligus. Gunakan template agar format valid.
          </p>
        </div>

        {bulkError ? <Alert title="Error bulk upload" message={bulkError} /> : null}
        {bulkResult ? <Alert title="Hasil bulk upload" message={bulkResult} variant="success" /> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={downloadTemplate} className="h-10">
            Download Template CSV
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Pilih file CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void onChooseCsvFile(e)}
            disabled={bulkRunning}
            className="block w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kolom wajib: {BULK_TEMPLATE_HEADER.join(', ')}
          </p>
          {bulkFileName ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              File: <span className="font-semibold">{bulkFileName}</span> ({bulkRows.length} baris)
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          Nilai enum harus persis seperti template (contoh: MALE/FEMALE, HEAD_OFFICE, WORKER, ACTIVE).
        </div>

        <Button type="button" disabled={bulkRunning || bulkRows.length === 0} onClick={() => void submitBulkUsers()} className="h-11 w-full sm:w-auto sm:min-w-[220px]">
          {bulkRunning ? 'Memproses bulk upload...' : 'Upload & Buat User'}
        </Button>
      </div>
    </div>
  );
}
