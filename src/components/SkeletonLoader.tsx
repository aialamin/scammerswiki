import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      </div>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 6 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-3">
          <div
            className={`h-4 bg-slate-200 dark:bg-slate-800 rounded ${
              idx === 0
                ? 'w-24'
                : idx === columns - 1
                ? 'w-16 ml-auto'
                : idx % 2 === 0
                ? 'w-32'
                : 'w-20'
            }`}
          ></div>
        </td>
      ))}
    </tr>
  );
};
