import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { formatCurrency, formatShortDate } from "../../utils/format";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-card">
      <p className="text-[11px] text-text-muted mb-1">{d.payload.dateLabel}</p>
      <p className="text-sm font-semibold text-text-primary">{formatCurrency(d.value)}</p>
    </div>
  );
};

export default function BalanceTrendChart({ data = [] }) {
  const chartData = data.map((d) => ({
    date: formatShortDate(d.transactionDate),
    dateLabel: formatShortDate(d.transactionDate),
    balance: d.balanceAfter,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-text-muted">
        No transactions yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#111111" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#111111" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#888888" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#888888" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#111111"
          strokeWidth={1.5}
          fill="url(#balanceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#111111", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
