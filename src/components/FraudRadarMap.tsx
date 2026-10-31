import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.ts';

export const FraudRadarMap: React.FC<{ onViewReport: (reportId: string) => void }> = ({
  onViewReport,
}) => {
  const [activeDivision, setActiveDivision] = useState<string>('dhaka');

  const divisions = [
    {
      id: 'dhaka',
      name: 'ঢাকা বিভাগ',
      incidents: 14,
      loss: '৳ ১,৪২,৫০০',
      hotspot: 'বসুন্ধরা, মিরপুর ও উত্তরা এলাকার ভুয়া ফেসবুক শপ ক্লাস্টার',
      recentCase: 'SBD-2026-89102 (আইফোন অগ্রিম বুকিং চার্জ ফাঁদ)',
      reportId: 'SBD-2026-89102',
    },
    {
      id: 'chattogram',
      name: 'চট্টগ্রাম বিভাগ',
      incidents: 8,
      loss: '৳ ৬৮,০০০',
      hotspot: 'জিইসি মোড় ও আগ্রাবাদ এলাকার ইমপোর্টেড স্নিকার ক্লোন পেজ',
      recentCase: 'SBD-2026-89103 (নগদ অগ্রিম চার্জ নিয়ে ব্লক)',
      reportId: 'SBD-2026-89103',
    },
    {
      id: 'sylhet',
      name: 'সিলেট বিভাগ',
      incidents: 5,
      loss: '৳ ৪৫,০০০',
      hotspot: 'জিন্দাবাজার ও রেমিট্যান্স সম্পর্কিত টেলিগ্রাম টাস্ক ফিশিং',
      recentCase: 'SBD-2026-89104 (টেলিগ্রাম ইনভেস্টমেন্ট স্ক্যাম)',
      reportId: 'SBD-2026-89104',
    },
    {
      id: 'rajshahi',
      name: 'রাজশাহী বিভাগ',
      incidents: 4,
      loss: '৳ ২৮,০০০',
      hotspot: 'আমের সিজনাল অফার ও সিল্ক বুটিকের ভুয়া অগ্রিম ডেলিভারি ফি',
      recentCase: 'SBD-2026-89105 (দেশি ফ্যাশন পোশাকের ভুয়া পেজ)',
      reportId: 'SBD-2026-89105',
    },
  ];

  const current = divisions.find((d) => d.id === activeDivision) || divisions[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl overflow-hidden relative">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Info */}
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-bold uppercase tracking-wider">সরাসরি বাংলাদেশ প্রতারণা নজরদারি রাডার</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              বিভাগভিত্তিক সক্রিয় প্রতারণার লাইভ পর্যবেক্ষণ
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              ScamAlert BD বাংলাদেশের ৮টি প্রশাসনিক বিভাগের প্রাপ্ত অভিযোগ বিশ্লেষণ করে ভুয়া কুরিয়ার স্কিম, ভুয়া ফেসবুক পেজ এবং সন্দেহভাজন এমএফএস নম্বরের সক্রিয় হটস্পট শনাক্ত করে।
            </p>

            {/* Division Selector Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {divisions.map((d) => (
                <motion.button
                  key={d.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveDivision(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeDivision === d.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {d.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Radar Card */}
          <div className="lg:w-96 p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg space-y-4 text-xs font-sans">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                    <MapPin className="w-4 h-4 text-red-400 stroke-[2.2]" />
                    <span>{current.name}</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">
                    সক্রিয় অভিযোগ: <strong className="text-red-400 font-bold">{toBengaliNumber(current.incidents)}</strong> টি
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">রিপোর্টকৃত মোট ক্ষতি</span>
                    <span className="text-base font-bold text-red-400 font-sans">
                      {current.loss}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">প্রধান প্রবণতা</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      কুরিয়ার অগ্রিম চার্জ
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-medium">প্রচলিত কৌশলের বিবরণ</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {current.hotspot}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    সর্বশেষ: {current.recentCase}
                  </span>
                  <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onViewReport(current.reportId)}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                  >
                    <span>তদন্ত দেখুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
