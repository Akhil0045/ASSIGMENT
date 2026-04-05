import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const CustomXAxisTick = ({ x, y, payload, activeIndex, index }) => {
  const { value } = payload; // format: "9|MAR"
  const [day, month] = value.split('|');
  const isActive = activeIndex === index;

  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} y={0} dy={16} 
        textAnchor="middle" 
        fill={isActive ? '#3b82f6' : '#64748b'} 
        className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}
      >
        {day}
      </text>
      <text 
        x={0} y={0} dy={30} 
        textAnchor="middle" 
        fill={isActive ? '#3b82f6' : '#94a3b8'} 
        className="text-[10px] uppercase tracking-wider font-semibold"
      >
        {month}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="text-slate-300 font-semibold mb-1">{payload[0].payload.fullDateString}</p>
        <p className="text-emerald-400 font-bold">Income: ${payload[0].payload.income.toLocaleString()}</p>
        <p className="text-rose-400 font-bold">Expense: ${payload[0].payload.expense.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const DailyTrendChart = ({ data, activeIndex, onBarClick }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
          barCategoryGap="15%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="axisLabel" 
            axisLine={false} 
            tickLine={false}
            tick={<CustomXAxisTick activeIndex={activeIndex} />} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          
          <Bar dataKey="income" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-inc-${index}`} onClick={() => onBarClick(index)} cursor="pointer" />
            ))}
          </Bar>
          <Bar dataKey="expense" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-exp-${index}`} onClick={() => onBarClick(index)} cursor="pointer" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyTrendChart;
