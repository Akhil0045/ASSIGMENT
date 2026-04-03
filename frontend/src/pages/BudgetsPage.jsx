import React from 'react';
import BudgetManager from '../components/BudgetManager';

const BudgetsPage = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Budget Tracking</h2>
        <p className="text-slate-500 mt-1">Establish exact numerical constraints across any category layer natively.</p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <BudgetManager />
      </div>
    </div>
  );
};

export default BudgetsPage;
