import { AdminBudgetSummary } from '../../../components/admin/AdminBudgetSummary';
import { BudgetPolicyEditor } from '../../../components/admin/BudgetPolicyEditor';

export default function AdminBudgetPage() {
  return (
    <div className="w-full max-w-none">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Budget Settings
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Atur plafon per <span className="font-semibold">Position</span> untuk Rawat Jalan, Rawat Inap (cap per episode),
            dan Melahirkan (female only). Semua value dipisahkan per <span className="font-semibold">year</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            Admin only
          </span>
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
            Reset per year
          </span>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            3 benefit types
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AdminBudgetSummary />

        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">Budget Setting</div>
          <BudgetPolicyEditor />
        </div>
      </div>
    </div>
  );
}

