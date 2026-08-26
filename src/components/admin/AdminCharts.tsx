'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function formatRupiahFull(value: number): string {
  return value.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

const BENEFIT_COLORS: Record<string, string> = {
  'Rawat Jalan': '#6366f1',
  'Rawat Inap': '#ec4899',
  'Melahirkan': '#f59e0b',
};

const DEPT_COLORS = {
  allocated: '#6366f1',
  spent: '#ec4899',
};

const POSITION_COLORS = {
  rawatJalan: '#6366f1',
  rawatInap: '#ec4899',
  melahirkan: '#f59e0b',
};

const TREND_COLOR_RJ = '#6366f1';
const TREND_COLOR_RI = '#ec4899';

// ─── Shared Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {label && (
        <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: p.color ?? '#6366f1' }}
          />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{p.name}:</span>
          <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
            {formatRupiahFull(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 1. Donut Chart — Spend Breakdown by Benefit Type ────────────────────────

export type DonutChartDatum = {
  name: string; // 'Rawat Jalan' | 'Rawat Inap' | 'Melahirkan'
  value: number;
};

interface DonutChartProps {
  data: DonutChartDatum[];
}

const RADIAN = Math.PI / 180;

function renderCustomLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function DonutSpendChart({ data }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={BENEFIT_COLORS[entry.name] ?? '#a1a1aa'}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend + totals */}
      <div className="space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: BENEFIT_COLORS[d.name] ?? '#a1a1aa' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {d.name}
                  </span>
                  <span className="tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRupiahShort(d.value)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: BENEFIT_COLORS[d.name] ?? '#a1a1aa',
                    }}
                  />
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-400">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 2. Bar Chart — Utilization by Department ────────────────────────────────

export type DeptUtilizationDatum = {
  dept: string;
  allocated: number;
  spent: number;
};

interface DeptUtilizationChartProps {
  data: DeptUtilizationDatum[];
}

export function DeptUtilizationChart({ data }: DeptUtilizationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="28%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.2)" vertical={false} />
        <XAxis
          dataKey="dept"
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={44}
        />
        <YAxis
          tickFormatter={formatRupiahShort}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          width={58}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(val) => (
            <span className="text-zinc-600 dark:text-zinc-400">
              {val === 'allocated' ? 'Alokasi' : 'Terpakai'}
            </span>
          )}
        />
        <Bar dataKey="allocated" name="allocated" fill={DEPT_COLORS.allocated} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="spent" name="spent" fill={DEPT_COLORS.spent} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 3. Horizontal Bar — Top Spend Trends ────────────────────────────────────

export type TrendDatum = {
  name: string;
  amount: number;
  count: number;
};

interface TrendChartProps {
  data: TrendDatum[];
  color: string;
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrendDatum; value: number; color?: string }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{d.name}</p>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {formatRupiahFull(d.amount)}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{d.count} transaksi</p>
    </div>
  );
}

export function TrendBarChart({ data, color }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(140, data.length * 44)}>
      <BarChart data={data} layout="vertical" barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.15)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatRupiahShort}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fill: '#52525b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<TrendTooltip />} cursor={{ fill: `${color}14` }} />
        <Bar dataKey="amount" fill={color} radius={[0, 6, 6, 0]} maxBarSize={22}>
          <LabelList
            dataKey="amount"
            position="right"
            formatter={(value: unknown) => formatRupiahShort(Number(value))}
            style={{ fontSize: 11, fill: '#71717a' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export { TREND_COLOR_RJ, TREND_COLOR_RI };

// ─── 4. Stacked Bar — Policy Budget by Position ───────────────────────────────

export type PolicyPositionDatum = {
  position: string;
  rawatJalan: number;
  rawatInap: number;
  melahirkan: number;
};

interface PolicyPositionChartProps {
  data: PolicyPositionDatum[];
}

export function PolicyPositionChart({ data }: PolicyPositionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.2)" vertical={false} />
        <XAxis
          dataKey="position"
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={44}
        />
        <YAxis
          tickFormatter={formatRupiahShort}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          width={62}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(val) => {
            const map: Record<string, string> = {
              rawatJalan: 'Rawat Jalan',
              rawatInap: 'Rawat Inap',
              melahirkan: 'Melahirkan',
            };
            return <span className="text-zinc-600 dark:text-zinc-400">{map[val] ?? val}</span>;
          }}
        />
        <Bar
          dataKey="rawatJalan"
          name="rawatJalan"
          stackId="policy"
          fill={POSITION_COLORS.rawatJalan}
          radius={[0, 0, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="rawatInap"
          name="rawatInap"
          stackId="policy"
          fill={POSITION_COLORS.rawatInap}
          radius={[0, 0, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="melahirkan"
          name="melahirkan"
          stackId="policy"
          fill={POSITION_COLORS.melahirkan}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
