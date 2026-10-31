import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Phone,
  MessageSquare,
  Facebook,
  Globe,
  Wallet,
  Smartphone,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { normalizeBDPhone } from '../utils/normalizerClient.ts';
import { CATEGORIES_BN, toBengaliNumber } from '../utils/bengali.ts';

interface HeroSearchProps {
  onSearch: (query: string, category: string) => void;
  initialQuery?: string;
  initialCategory?: string;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  initialQuery = '',
  initialCategory = 'all',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [suggestions, setSuggestions] = useState<Array<{ label: string; category: string; type: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live operator/format detection
  const phoneAnalysis = normalizeBDPhone(query);

  const getOperatorBn = (op?: string) => {
    switch (op) {
      case 'Grameenphone':
        return 'গ্রামীণফোন (GP)';
      case 'Robi':
        return 'রবি (Robi)';
      case 'Banglalink':
        return 'বাংলালিংক (BL)';
      case 'Airtel':
        return 'এয়ারটেল (Airtel)';
      case 'Teletalk':
        return 'টেলিটক (Teletalk)';
      default:
        return op || '';
    }
  };

  // Fetch suggestions debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.search.suggestions(query.trim());
        if (res.success) {
          setSuggestions(res.suggestions || []);
        }
      } catch {
        // Silent catch
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    onSearch(query.trim(), selectedCategory);
  };

  const handleSelectSuggestion = (label: string, category: string) => {
    setQuery(label);
    if (category && category !== 'report') {
      setSelectedCategory(category);
    }
    setShowSuggestions(false);
    onSearch(label, category === 'report' ? 'all' : category);
  };

  const sampleSearches = [
    { label: '01711987654', cat: 'bkash', desc: 'বিকাশ অগ্রিম প্রতারণা' },
    { label: '01822334455', cat: 'nagad', desc: 'নগদ জুতার পেজ' },
    { label: 'gadgetmartbd.official', cat: 'facebook', desc: 'ফেসবুক পেজ' },
    { label: 'daraz-vip-tasks-bd.xyz', cat: 'website', desc: 'ভুয়া টাস্ক সাইট' },
  ];

  return (
    <div className="relative pt-10 pb-14 md:pt-16 md:pb-20 overflow-hidden bg-grid-pattern">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle trust headline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>বাংলাদেশ জাতীয় নাগরিক অনলাইন প্রতারণা প্রতিরোধ সেল</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2] mb-4 max-w-4xl mx-auto text-balance">
          থামুন। খুঁজুন।{' '}
          <span className="text-red-600 dark:text-red-500">
            সুরক্ষিত থাকুন।
          </span>
        </h1>

        {/* Concise value proposition copy */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          টাকা পাঠানোর আগেই বিক্রেতার ফোন নম্বর, ফেসবুক পেজ, বিকাশ, নগদ বা রকেট অ্যাকাউন্ট যাচাই করে প্রতারণার হাত থেকে নিরাপদে থাকুন।
        </p>

        {/* Category Filter Pills (Functional button controls) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mb-5">
          {CATEGORIES_BN.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-[#fef2f2] dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-red-700 dark:hover:text-white border border-red-200/90 dark:border-slate-800 shadow-xs'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Central Search Box */}
        <div ref={searchContainerRef} className="relative max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center p-2 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 shadow-xl shadow-red-500/5 dark:shadow-black/50 border-2 border-red-200/90 dark:border-slate-800 focus-within:border-red-500 dark:focus-within:border-red-500 transition-colors"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-slate-400" />
            </div>

            <div className="w-full relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="মোবাইল নম্বর (০১৭...), ফেসবুক পেজ, ওয়েবসাইট বা বিকাশ/নগদ নম্বর লিখুন..."
                className="w-full py-2.5 px-2 text-sm sm:text-base text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-400 font-sans"
              />

              {/* Real-time Operator/Format Pill inside input */}
              {phoneAnalysis.operator && phoneAnalysis.isValidBD && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[11px] font-mono font-medium shrink-0 mr-2">
                  <span>{getOperatorBn(phoneAnalysis.operator)}</span>
                  <span className="text-slate-400">·</span>
                  <span>{phoneAnalysis.canonical}</span>
                </div>
              )}
            </div>

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2 text-xs font-semibold"
              >
                মুছুন
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition shrink-0"
            >
              <span>অনুসন্ধান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-[#fef2f2] dark:bg-slate-900 shadow-2xl border border-red-200/90 dark:border-slate-800 overflow-hidden z-40 text-left divide-y divide-red-100 dark:divide-slate-800">
              <div className="px-4 py-2 bg-red-100/60 dark:bg-slate-800/50 text-[11px] font-bold text-red-900 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>ডাটাবেজে মিলে যাওয়া রেকর্ডসমূহ</span>
                <span className="text-[10px] text-red-700/70 dark:text-slate-400">পরীক্ষা করতে নির্বাচন করুন</span>
              </div>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(s.label, s.category)}
                  className="px-4 py-2.5 hover:bg-red-100/60 dark:hover:bg-red-950/20 cursor-pointer flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-red-600 border border-red-200/60 dark:border-transparent">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {s.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Sample Queries */}
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-400">উদাহরণ অনুসন্ধান:</span>
          {sampleSearches.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sample.label);
                setSelectedCategory(sample.cat);
                onSearch(sample.label, sample.cat);
              }}
              className="px-2.5 py-1 rounded-md bg-[#fef2f2] dark:bg-slate-800/80 hover:bg-red-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-[11px] font-mono font-medium border border-red-200/80 dark:border-slate-700 shadow-2xs"
            >
              {sample.label} <span className="text-slate-400 text-[10px]">({sample.desc})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
