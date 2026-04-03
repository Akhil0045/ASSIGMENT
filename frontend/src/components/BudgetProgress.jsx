import React from 'react';

const BudgetProgress = ({ budget }) => {
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
  
  // Decide color logic based on utilization percentage
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';
  let bgColor = 'bg-emerald-50';

  if (percentage >= 100) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700';
    bgColor = 'bg-rose-50';
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
    bgColor = 'bg-amber-50';
  }

  return (
    <div className={`p-4 rounded-xl border border-slate-100 ${bgColor} transition-colors`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-slate-800 capitalize">{budget.category}</h4>
        <span className={`text-sm font-bold ${textColor}`}>
          ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
        </span>
      </div>
      
      <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-slate-200">
        <div 
          className={`h-2.5 rounded-full ${barColor} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-xs text-slate-500 text-right">
        {budget.remaining >= 0 ? (
          <span>${budget.remaining.toFixed(2)} remaining</span>
        ) : (
          <span className="text-rose-600 font-medium">Over budget by ${Math.abs(budget.remaining).toFixed(2)}!</span>
        )}
      </div>
    </div>
  );
};

export default BudgetProgress;
