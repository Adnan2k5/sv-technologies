import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { formatCurrency, formatChartMonth } from "../../utils/format";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-card">
      <p className="text-[11px] text-text-muted mb-1">{payload[0].payload.label}</p>
      <p className="text-sm font-semibold text-text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function MonthlySpendChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-text-muted">
        No data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    label: formatChartMonth(d._id),
    value: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#888888" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#888888" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F2F2F2", radius: 4 }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={i === chartData.length - 1 ? "#111111" : "#D4D4D4"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
