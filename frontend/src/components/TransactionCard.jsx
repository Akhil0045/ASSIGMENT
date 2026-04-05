import React from 'react';
import { Link } from 'react-router-dom';

const TransactionCard = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group ${isIncome ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'}`}>
      <div className="flex-1 mb-4 sm:mb-0">
        <div className="flex items-center space-x-3 mb-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {transaction.type}
          </span>
          <h4 className="text-lg font-semibold text-slate-800">{transaction.category}</h4>
        </div>
        <p className="text-sm text-slate-500 mb-1">{new Date(transaction.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {transaction.description && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg inline-block">{transaction.description}</p>}
      </div>
      
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2">
        <div className={`text-xl font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isIncome ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Link 
            to={`/edit-transaction/${transaction._id}`} 
            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            Edit
          </Link>
          <button 
            onClick={() => onDelete(transaction._id)} 
            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
