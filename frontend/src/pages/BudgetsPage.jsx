import React, { useState } from 'react';
import BudgetManager from '../components/BudgetManager';
import UserFilter from '../components/UserFilter';

const BudgetsPage = () => {
  const [filterEmail, setFilterEmail] = useState('');

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Budget Control</h2>
        <p className="text-slate-500 mt-1">Define spending limits per category and monitor actual vs. budgeted amounts.</p>
      </div>

      <UserFilter
        activeEmail={filterEmail}
        onFilter={setFilterEmail}
        onClear={() => setFilterEmail('')}
      />

      <div className="flex-1 min-h-[500px]">
        <BudgetManager filterEmail={filterEmail} />
      </div>
    </div>
  );
};

export default BudgetsPage;
