import type { Position } from '../../types/types';
import { POSITION_LABEL } from '../../constants/positionLabels';
import { TextField } from '../ui/TextField';

export function BudgetPolicyRow({
  position,
  amount,
  onAmountChange,
}: {
  position: Position;
  amount: string;
  onAmountChange: (next: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-[220px_1fr] sm:items-center">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {POSITION_LABEL[position]}
      </div>

      <TextField
        label="Annual Amount"
        type="number"
        inputMode="decimal"
        step="0.01"
        name={`amount-${position}`}
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder="contoh: 1500000.00"
      />
    </div>
  );
}

