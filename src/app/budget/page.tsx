import UserLayout from '../../components/user/UserLayout';
import { MyBudgetWidget } from '../../components/user/MyBudgetWidget';

export default function BudgetPage() {
  return (
    <UserLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            My Budget
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Monitoring alokasi dan pemakaian budget asuransi berdasarkan{' '}
            <span className="font-semibold">year</span>. Nilai akan reset per tahun
            sesuai policy yang ditetapkan admin.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
          <MyBudgetWidget />
        </div>
      </div>
    </UserLayout>
  );
}

