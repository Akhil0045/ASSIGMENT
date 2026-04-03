import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700">
        <p className="text-slate-300 font-semibold mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name}: ${p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TrendBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 italic text-center py-10">No trend data available</div>;
  }

  // Format date for x-axis tick: "2026-03-14" → "Mar 14"
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 50 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
            angle={-40}
            textAnchor="end"
            interval={Math.ceil(data.length / 8)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend
            wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: '600' }}
          />
          <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendBarChart;
