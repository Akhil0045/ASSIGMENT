import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  '#6366f1', '#34d399', '#f59e0b', '#f87171',
  '#818cf8', '#2dd4bf', '#fb923c', '#a78bfa',
  '#4ade80', '#60a5fa', '#e879f9', '#fbbf24'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700">
        <p className="text-slate-300 font-semibold mb-1 capitalize">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.fill }} className="font-bold text-sm">
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4 px-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }}></span>
          <span className="capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 italic text-center py-10">No expense data available</div>;
  }

  const dataWithFill = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={dataWithFill}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {dataWithFill.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
