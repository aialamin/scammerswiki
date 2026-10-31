import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ShieldCheck, Search, Users } from 'lucide-react';
import { api } from '../services/api.ts';
import { Statistics } from '../types/index.ts';
import { toBengaliNumber } from '../utils/bengali.ts';

export const StatisticsBar: React.FC = () => {
  const [stats, setStats] = useState<Statistics>({
    totalReports: 5,
    verifiedIncidents: 2,
    pendingReports: 1,
    underReviewReports: 1,
    disputedReports: 1,
    totalSearches: 14820,
    communityMembers: 3843,
    totalAmountLossBDT: 24200,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.stats.get();
      if (res.stats) {
        setStats(res.stats);
      }
    } catch {
      // Keep existing stats on failure
    }
  };

  const statItems = [
    {
      label: 'মোট দাখিলকৃত রিপোর্ট',
      value: toBengaliNumber(stats.totalReports),
      subtext: `${toBengaliNumber(stats.pendingReports)}টি পর্যালোচনায় রয়েছে`,
      icon: ShieldAlert,
      iconBg: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800/60',
      glow: 'group-hover:border-red-400/60 dark:group-hover:border-red-700/60',
    },
    {
      label: 'যাচাইকৃত প্রতারণা ঘটনা',
      value: toBengaliNumber(stats.verifiedIncidents),
      subtext: 'প্রমাণিত ও যাচাইকৃত তথ্য',
      icon: ShieldCheck,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60',
      glow: 'group-hover:border-rose-400/60 dark:group-hover:border-rose-700/60',
    },
    {
      label: 'সর্বমোট অনুসন্ধান',
      value: toBengaliNumber(stats.totalSearches),
      subtext: 'নাগরিকরা যাচাই করেছেন',
      icon: Search,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60',
      glow: 'group-hover:border-blue-400/60 dark:group-hover:border-blue-700/60',
    },
    {
      label: 'সতর্ক নাগরিক সম্প্রদায়',
      value: toBengaliNumber(stats.communityMembers),
      subtext: 'দেশজুড়ে সক্রিয় পাহারাদার',
      icon: Users,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      glow: 'group-hover:border-emerald-400/60 dark:group-hover:border-emerald-700/60',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08),0_1px_3px_rgba(239,68,68,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] hover:border-red-300 dark:hover:border-slate-700 hover:shadow-[0_12px_24px_-4px_rgba(239,68,68,0.16)] dark:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.65)] transition-all duration-200 ${item.glow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
                  {item.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${item.iconBg}`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-sans tabular-nums">
                {item.value}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>{item.subtext}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
