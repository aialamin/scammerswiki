import React from 'react';
import { ShieldAlert, Clock, Scale, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ReportStatus } from '../types/index.ts';
import { STATUS_MAP_BN } from '../utils/bengali.ts';

interface StatusBadgeProps {
  status: ReportStatus | 'no_reports' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const basePillClasses =
    size === 'sm'
      ? 'px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight inline-flex items-center gap-1.5'
      : size === 'lg'
      ? 'px-3 py-1.5 rounded-lg text-sm font-bold tracking-tight inline-flex items-center gap-2'
      : 'px-2.5 py-1 rounded-md text-xs font-bold tracking-tight inline-flex items-center gap-1.5';

  const info = STATUS_MAP_BN[status] || {
    label: status,
    desc: '',
    color: 'slate',
  };

  switch (status) {
    case 'verified_incident':
      return (
        <span className={`${basePillClasses} bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/90 dark:border-red-900/60 shadow-2xs`}>
          {showIcon && <ShieldAlert className={`${iconSize} text-red-600 dark:text-red-400 shrink-0 stroke-[2.2]`} />}
          <span>{info.label}</span>
        </span>
      );

    case 'under_review':
      return (
        <span className={`${basePillClasses} bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/90 dark:border-amber-900/60 shadow-2xs`}>
          {showIcon && <Clock className={`${iconSize} text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]`} />}
          <span>{info.label}</span>
        </span>
      );

    case 'disputed':
      return (
        <span className={`${basePillClasses} bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200/90 dark:border-sky-900/60 shadow-2xs`}>
          {showIcon && <Scale className={`${iconSize} text-sky-600 dark:text-sky-400 shrink-0 stroke-[2.2]`} />}
          <span>{info.label}</span>
        </span>
      );

    case 'pending_review':
      return (
        <span className={`${basePillClasses} bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs`}>
          {showIcon && <AlertTriangle className={`${iconSize} text-slate-500 shrink-0 stroke-[2.2]`} />}
          <span>{info.label}</span>
        </span>
      );

    case 'rejected':
      return (
        <span className={`${basePillClasses} bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60`}>
          {showIcon && <XCircle className={`${iconSize} text-slate-400 shrink-0 stroke-[2.2]`} />}
          <span>{info.label}</span>
        </span>
      );

    case 'no_reports':
      return (
        <span className={`${basePillClasses} bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-900/60 shadow-2xs`}>
          {showIcon && <CheckCircle2 className={`${iconSize} text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.2]`} />}
          <span>{info.label}</span>
        </span>
      );

    default:
      return (
        <span className={`${basePillClasses} bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700`}>
          <span>{info.label}</span>
        </span>
      );
  }
};
