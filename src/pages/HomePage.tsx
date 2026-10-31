import React, { useState, useEffect } from 'react';
import { HeroSearch } from '../components/HeroSearch.tsx';
import { StatisticsBar } from '../components/StatisticsBar.tsx';
import { RecentReports } from '../components/RecentReports.tsx';
import { HowItWorks } from '../components/HowItWorks.tsx';
import { FraudRadarMap } from '../components/FraudRadarMap.tsx';
import { ScamRiskCalculator } from '../components/ScamRiskCalculator.tsx';
import { api } from '../services/api.ts';
import { Report } from '../types/index.ts';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Package,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface HomePageProps {
  onSearch: (query: string, category: string) => void;
  onNavigate: (page: string, params?: any) => void;
  onViewReport: (reportId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  onNavigate,
  onViewReport,
}) => {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getAll({ limit: 6 });
      if (res.success && res.reports) {
        setRecentReports(res.reports);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Hero Search Section with Real-Time BD Operator Detection */}
      <HeroSearch
        onSearch={(q, cat) => onSearch(q, cat)}
      />

      {/* 2. Live Platform Metrics */}
      <StatisticsBar />

      {/* 3. Real-Time Regional Bangladesh Threat Radar */}
      <FraudRadarMap onViewReport={onViewReport} />

      {/* 4. Active Scam Vectors in Bangladesh */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 dark:bg-slate-900/60 border border-red-200/80 dark:border-slate-800">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              সক্রিয় অনলাইন প্রতারণার ধরণ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              বর্তমানে বাংলাদেশে সবচেয়ে বেশি সক্রিয় ৩টি প্রতারণার কৌশল
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-sans">
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08),0_1px_3px_rgba(239,68,68,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(239,68,68,0.16)] dark:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.65)] hover:border-red-300 dark:hover:border-slate-700 transition-all duration-200 space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center shadow-2xs">
                <Package className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-sm text-red-600 dark:text-red-400 block font-sans">
                ১. "কুরিয়ার অগ্রিম চার্জ" প্রতারণা
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                ফেসবুকে বাজারমূল্যের চেয়ে ৭০% কম দামে আকর্ষণীয় পণ্য দেখিয়ে ক্রেতার বিশ্বাস অর্জন করে। পরে "ডেলিভারি চার্জ" বাবদ ব্যক্তিগত বিকাশ বা নগদে ১৫০–৫০০ টাকা নিয়ে ক্রেতাকে সঙ্গে সঙ্গে ব্লক করে দেয়।
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08),0_1px_3px_rgba(239,68,68,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(239,68,68,0.16)] dark:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.65)] hover:border-red-300 dark:hover:border-slate-700 transition-all duration-200 space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center shadow-2xs">
                <TrendingDown className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-sm text-amber-700 dark:text-amber-400 block font-sans">
                ২. ভুয়া দারাজ ও টেলিগ্রাম টাস্ক জব
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                হোয়াটসঅ্যাপে ঘরে বসে প্রতিদিন ১০০০–৩০০০ টাকা আয়ের লোভ দেখিয়ে টেলিগ্রাম গ্রুপে যুক্ত করে। শুরুতে অল্প টাকা ফেরত দিয়ে বিশ্বাস তৈরি করে পরে ভিআইপি টাস্ক আনলকের নামে বড় অঙ্কের টাকা হাতিয়ে নেয়।
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08),0_1px_3px_rgba(239,68,68,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(239,68,68,0.16)] dark:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.65)] hover:border-red-300 dark:hover:border-slate-700 transition-all duration-200 space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center shadow-2xs">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-sm text-blue-700 dark:text-blue-400 block font-sans">
                ৩. নামকরা ব্র্যান্ডের ক্লোন ফেসবুক পেজ
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                বসুন্ধরা সিটি বা যমুনা ফিউচার পার্কের সুপরিচিত দোকানের নাম ও লোগো নকল করে ভুয়া ফেসবুক পেজ খোলা হয়। অর্ডার করার পূর্বে সবসময় তাদের আসল ফোন নম্বর ও পেজ ট্রান্সপারেন্সি চেক করুন।
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 5. Interactive Algorithmic Scam Risk Calculator */}
      <ScamRiskCalculator
        onSearchScenario={(term) => onSearch(term, 'all')}
      />

      {/* 6. Recent Verified & Moderated Reports Feed */}
      <RecentReports
        reports={recentReports}
        onViewReport={onViewReport}
        onExploreAll={() => onNavigate('search')}
      />

      {/* 7. How ScamAlert BD Works: 4-Step Process */}
      <HowItWorks
        onStartSearch={() => onNavigate('search')}
        onReportClick={() => onNavigate('report-submit')}
      />

      {/* 8. Institutional Transparency & Anti-Defamation Charter */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>নিরপেক্ষ ও নাগরিক পরিচালিত ভেরিফিকেশন নীতিমালা</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              মিথ্যা অভিযোগ ও মানহানির বিরুদ্ধে আমাদের কঠোর অবস্থান
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              বাংলাদেশের সৎ ও পরিশ্রমী ই-কমার্স উদ্যোক্তাদের অযথা হয়রানি থেকে সুরক্ষা দিতে ScamAlert BD কঠোর যাচাইকরণ প্রক্রিয়া অনুসরণ করে। পর্যাপ্ত প্রমাণ (যেমন: বিকাশ/নগদ ট্রানজেকশন স্লিপ, চ্যাট হিস্ট্রি বা কুরিয়ার ট্র্যাকিং) ছাড়া কোনো অভিযোগকে প্রমাণিত হিসেবে প্রকাশ করা হয় না। প্রতিটি অভিযুক্ত বিক্রেতার আনুষ্ঠানিক আপত্তি ও আপিল করার পূর্ণ আইনি অধিকার রয়েছে।
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <button
                onClick={() => onNavigate('how-it-works')}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition"
              >
                যাচাইকরণ নীতিমালা
              </button>
              <button
                onClick={() => onNavigate('safety-guide')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ভোক্তা সুরক্ষা গাইড
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
