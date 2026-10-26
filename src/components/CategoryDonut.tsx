import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../auth/authContext';
import type { CategoryTotal } from '../api/types';
import { formatMoney } from '../lib/format';

const CHART_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

export function CategoryDonut({ data }: { data: CategoryTotal[] }) {
  const { user } = useAuth();
  const currency = user?.defaultCurrency ?? 'USD';
  return (
    <div className="chart" role="img" aria-label="Spending by category">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
            {data.map((d, i) => (
              <Cell key={d.categoryId} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => formatMoney(v, currency)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
