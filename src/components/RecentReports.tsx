import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Phone,
  Facebook,
  Globe,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Report, ReportCategory } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { formatBDT, formatBengaliDate, toBengaliNumber, CATEGORIES_BN } from '../utils/bengali.ts';

interface RecentReportsProps {
  reports: Report[];
  onViewReport: (reportId: string) => void;
  onExploreAll: () => void;
}

export const RecentReports: React.FC<RecentReportsProps> = ({
  reports,
  onViewReport,
  onExploreAll,
}) => {
  const getCategoryLabelBn = (cat: string) => {
    const found = CATEGORIES_BN.find((c) => c.id === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
            সচেতন নাগরিক রেজিস্ট্রি
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            সাম্প্রতিক প্রতারণার ঘটনা ও সতর্কতা
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ভুক্তভোগী সাধারণ অনলাইন ক্রেতাদের দাখিলকৃত ও তদন্তাধীন অভিযোগের নিয়মিত আপডেট।
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onExploreAll}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition"
        >
          <span>পুরো ডাটাবেজ অনুসন্ধান করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-[#fef2f2] dark:bg-slate-900 rounded-2xl border border-red-200/90 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-sm">বর্তমানে কোনো সাম্প্রতিক রিপোর্ট নেই।</p>
        </div>
      ) : (
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reports.slice(0, 6).map((report) => (
            <motion.div
              key={report.id || report.reportId}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex flex-col justify-between p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08),0_1px_3px_rgba(239,68,68,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_30px_-4px_rgba(239,68,68,0.18)] dark:hover:shadow-[0_14px_30px_-4px_rgba(0,0,0,0.7)] hover:border-red-300 dark:hover:border-slate-700 transition-all duration-200 group"
            >
              <div>
                {/* Clean metadata header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{report.reportId}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="font-sans font-medium">{getCategoryLabelBn(report.category)}</span>
                  </div>

                  <StatusBadge status={report.status} size="sm" />
                </div>

                {/* Primary Identifier Target */}
                <div className="mb-2">
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-red-200/80 dark:border-slate-700/60 inline-block shadow-2xs">
                    {report.primaryIdentifier || report.identifiers.phone || 'অভিযুক্ত সত্ত্বা'}
                  </div>
                </div>

                {/* Product / incident title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {report.productOrService}
                </h3>

                {/* Incident Snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-sans">
                  {report.incidentDescription}
                </p>

                {/* Amount & Method Strip */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-red-200/70 dark:border-slate-700/70 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block uppercase font-bold">ক্ষতির পরিমাণ</span>
                    <span className="font-black text-slate-900 dark:text-white font-sans text-sm">
                      {formatBDT(report.transactionAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block uppercase font-bold">পেমেন্ট চ্যানেল</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px] block font-sans">
                      {report.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer info & CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans">
                  <span>{toBengaliNumber(report.corroboratingCount || 1)} জন ভুক্তভোগী</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatBengaliDate(report.createdAt)}</span>
                </div>

                <motion.button
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onViewReport(report.reportId)}
                  className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition"
                >
                  <span>প্রমাণ ও বিস্তারিত</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
