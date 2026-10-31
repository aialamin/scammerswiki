import React from 'react';
import { motion } from 'motion/react';
import { Search, Users, FileCheck2, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';

interface HowItWorksProps {
  onStartSearch: () => void;
  onReportClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartSearch, onReportClick }) => {
  const steps = [
    {
      step: '০১',
      title: '১. বিক্রেতার তথ্য খুঁজুন',
      description:
        'অগ্রিম কোনো টাকা পাঠানোর আগে বিক্রেতার মোবাইল নম্বর, হোয়াটসঅ্যাপ, ফেসবুক পেজের লিংক অথবা বিকাশ/নগদ/রকেট ওয়ালেট নম্বর দিয়ে সার্চ করুন।',
      icon: Search,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      step: '০২',
      title: '২. কমিউনিটি অভিযোগ দেখুন',
      description:
        'অন্য কোনো ক্রেতা ওই বিক্রেতার কাছে অগ্রিম কুরিয়ার চার্জ দিয়ে ব্লক হওয়া, নকল পণ্য পাওয়া বা পণ্য ডেলিভারি না পাওয়ার অভিযোগ করেছেন কিনা যাচাই করুন।',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
    },
    {
      step: '০৩',
      title: '৩. প্রমাণ ও স্ট্যাটাস যাচাই',
      description:
        'আমাদের তদন্ত টিম কর্তৃক যাচাইকৃত পেমেন্ট স্লিপ, চ্যাট স্ক্রিনশট ও স্ট্যাটাস ব্যাজ দেখুন এবং বিক্রেতার কোনো পাল্টা সমাধান রয়েছে কিনা পরীক্ষা করুন।',
      icon: FileCheck2,
      color: 'from-red-600 to-rose-600',
    },
    {
      step: '০৪',
      title: '৪. নিরাপদ কেনাকাটা সম্পন্ন করুন',
      description:
        'সন্দেহভাজন বিক্রেতাদের ক্ষেত্রে পার্সেল খুলে দেখে ক্যাশ অন ডেলিভারি (COD) বেছে নিন এবং ব্যক্তিগত নম্বরে অগ্রিম টাকা পাঠানো থেকে বিরত থাকুন।',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-600',
    },
  ];

  return (
    <section className="py-16 bg-slate-100/60 dark:bg-slate-900/50 border-y border-slate-200/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            ভোক্তা নিরাপত্তা রূপরেখা
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            ScamAlert BD যেভাবে আপনাকে সুরক্ষিত রাখে
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-normal">
            অনলাইনে নিরাপদ কেনাকাটা নিশ্চিত করার জন্য সহজ ও কার্যকর চার ধাপের যাচাই পদ্ধতি।
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08),0_1px_3px_rgba(239,68,68,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_30px_-4px_rgba(239,68,68,0.18)] dark:hover:shadow-[0_14px_30px_-4px_rgba(0,0,0,0.7)] hover:border-red-300 dark:hover:border-slate-700 flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-sans">
                      {item.step}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md shadow-slate-900/10`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>ধাপ {item.step} / ০৪</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action callout banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 p-8 text-white shadow-xl shadow-red-950/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              সন্দেহজনক বিক্রেতা বা প্রতারণার শিকার হয়েছেন?
            </h3>
            <p className="text-sm text-red-100 mt-1 max-w-xl font-normal leading-relaxed">
              পেমেন্ট রসিদ ও চ্যাট স্ক্রিনশট সংযুক্ত করে এখনই রিপোর্ট করুন—আপনার একটি সতর্কতা বাংলাদেশের হাজারো ক্রেতাকে সুরক্ষিত রাখবে।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onReportClick}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-white text-red-600 hover:bg-red-50 text-xs font-bold shadow-md transition"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
              <span>প্রতারণার অভিযোগ দাখিল করুন</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartSearch}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold border border-red-500/80 transition"
            >
              <Search className="w-4 h-4" />
              <span>ডাটাবেজে খুঁজুন</span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};
