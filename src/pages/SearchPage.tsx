import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  FileCheck2,
  Sparkles,
  Phone,
  MessageSquare,
  Facebook,
  Globe,
  Wallet,
  Smartphone,
  Info,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { SearchResultItem, SearchResponse } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CardSkeleton } from '../components/SkeletonLoader.tsx';
import { formatBDT, formatBengaliDate, toBengaliNumber, CATEGORIES_BN } from '../utils/bengali.ts';

interface SearchPageProps {
  initialQuery?: string;
  initialCategory?: string;
  onViewReport: (reportId: string) => void;
  onOpenReportSubmit: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  initialCategory = 'all',
  onViewReport,
  onOpenReportSubmit,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
    if (initialQuery) {
      executeSearch(initialQuery, initialCategory, 1);
    }
  }, [initialQuery, initialCategory]);

  const loadHistory = async () => {
    try {
      const res = await api.search.history();
      if (res.success) {
        setSearchHistory(res.history || []);
      }
    } catch {
      // Ignore
    }
  };

  const executeSearch = async (q: string, cat: string = category, page: number = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await api.search.query(q.trim(), cat, page, 8);
      setSearchResponse(res);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, category, 1);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (query.trim()) {
      executeSearch(query, newCat, 1);
    }
  };

  const getCategoryLabelBn = (catId: string) => {
    const found = CATEGORIES_BN.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh] font-sans">
      {/* Search Header Form */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          অনলাইন বিক্রেতা ও প্রতারক অনুসন্ধান ইঞ্জিন
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          সন্দেহজনক মোবাইল নম্বর, বিকাশ/নগদ ওয়ালেট বা ফেসবুক পেজ আমাদের রেজিস্ট্রি ডাটাবেজে মিলিয়ে দেখুন।
        </p>

        {/* Input box */}
        <form onSubmit={handleFormSubmit} className="relative">
          <div className="flex items-center p-2 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border-2 border-red-200/90 dark:border-slate-800 shadow-md shadow-red-500/5 focus-within:ring-2 focus-within:ring-red-500/40">
            <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="মোবাইল নম্বর (০১৭১...), ফেসবুক পেজ, ওয়েবসাইট বা বিকাশ/নগদ নম্বর লিখুন..."
              className="w-full py-2.5 px-2 text-sm text-slate-900 dark:text-white bg-transparent outline-none font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 mr-2 font-semibold"
              >
                মুছুন
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <span>{loading ? 'অনুসন্ধান চলছে...' : 'অনুসন্ধান'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-4">
          {CATEGORIES_BN.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                category === c.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-[#fef2f2] dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-red-100 border border-red-200/80 dark:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Normalization Feedback */}
      {searchResponse && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              অনুসন্ধানের ফলাফল:
            </span>
            <span className="font-mono font-bold text-red-600 dark:text-red-400 px-2 py-0.5 rounded bg-red-100/80 dark:bg-red-950/40 border border-red-200/60 dark:border-transparent">
              "{searchResponse.query}"
            </span>
            {searchResponse.normalizedQuery &&
              searchResponse.normalizedQuery !== searchResponse.query && (
                <span className="text-slate-400 hidden md:inline">
                  (ফরম্যাট: {searchResponse.normalizedQuery})
                </span>
              )}
          </div>

          <div className="text-slate-500 font-semibold">
            মোট <strong>{toBengaliNumber(searchResponse.total)}</strong> টি অভিযোগের রেকর্ড পাওয়া গেছে
          </div>
        </div>
      )}

      {/* Results Container */}
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : searchResponse ? (
          searchResponse.results.length === 0 ? (
            /* Empty State: No reports found */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="p-8 sm:p-12 text-center rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  "{searchResponse.query}" এর বিরুদ্ধে কোনো অভিযোগ পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
                  আমাদের ডাটাবেজে এই নম্বর বা অ্যাকাউন্টের বিরুদ্ধে এখনও পর্যন্ত কোনো সাধারণ ক্রেতার রিপোর্ট জমা পড়েনি।
                </p>
              </div>

              {/* Crucial Safety Caution Notice */}
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 text-left text-xs text-amber-900 dark:text-amber-200 space-y-1.5 font-sans shadow-2xs">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]" />
                  <span>জরুরি ক্রেতা সতর্কতা</span>
                </div>
                <p className="leading-relaxed">
                  কোনো রেকর্ড না পাওয়ার অর্থ এই <strong>নয়</strong> যে বিক্রেতা শতভাগ নিরাপদ। নতুন প্রতারকরা প্রতিনিয়ত নতুন সিম ও পেজ খোলে। তাই ব্যক্তিগত নম্বরে অগ্রিম টাকা না পাঠিয়ে সবসময় <strong>ক্যাশ অন ডেলিভারি (COD)</strong> ও পার্সেল খুলে দেখার শর্তে অর্ডার করুন।
                </p>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenReportSubmit}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>আপনি কি এই বিক্রেতার দ্বারা প্রতারিত হয়েছেন? রিপোর্ট করুন</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
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
                className="space-y-4"
              >
              {searchResponse.results.map((res) => (
                <motion.div
                  key={res.id || res.reportId}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.65)] hover:border-red-300 dark:hover:border-slate-700 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{res.reportId}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-sans font-medium">{getCategoryLabelBn(res.category)}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <StatusBadge status={res.status} size="sm" />
                    </div>

                    <span className="text-xs text-slate-400 font-sans">
                      {formatBengaliDate(res.lastReportDate)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {res.productOrService}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-sans">
                    {res.incidentSummary}
                  </p>

                  {/* Identifier & Loss Metrics */}
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-red-200/70 dark:border-slate-700/70 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">অভিযুক্ত নম্বর / পেজ</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-[#fef2f2] dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-slate-700 inline-block mt-0.5">
                        {res.primaryIdentifier}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">রিপোর্টকৃত ক্ষতির পরিমাণ</span>
                      <span className="font-bold text-red-600 dark:text-red-400 font-sans text-sm block mt-0.5">
                        {formatBDT(res.transactionAmountBDT)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">অভিযোগকারী ভুক্তভোগী</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans block mt-0.5">
                        {toBengaliNumber(res.corroboratingReportsCount)} জন
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">সংযুক্ত প্রমাণপত্র</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans block mt-0.5">
                        {res.hasEvidence ? `${toBengaliNumber(res.evidenceCount)}টি ফাইল` : 'কোনোটি নেই'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-red-100 dark:border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-sans">
                      নাগরিক সচেতনতা রেকর্ড
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onViewReport(res.reportId)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <span>সম্পূর্ণ প্রমাণ ও বিবরণ দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

              {/* Pagination */}
              {searchResponse.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  {Array.from({ length: searchResponse.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => executeSearch(query, category, p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition font-sans ${
                        currentPage === p
                          ? 'bg-red-600 text-white'
                          : 'bg-[#fef2f2] dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-red-100 border border-red-200/80 dark:border-slate-700'
                      }`}
                    >
                      {toBengaliNumber(p)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          /* Initial empty search helper */
          <div className="p-8 text-center rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4 font-sans">
            <Search className="w-10 h-10 text-red-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              কোনো বিক্রেতা বা পেমেন্ট অ্যাকাউন্ট যাচাই করতে চান?
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              যেকোনো বাংলাদেশি মোবাইল নম্বর (যেমন: ০১৭১২৩৪৫৬৭৮), ফেসবুক পেজের নাম, বিকাশ বা নগদ নম্বর লিখে সার্চ বোতামে চাপুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
