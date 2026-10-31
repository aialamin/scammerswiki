import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface SafetyGuidePageProps {
  onSearchClick: () => void;
  onReportClick: () => void;
}

export const SafetyGuidePage: React.FC<SafetyGuidePageProps> = ({
  onSearchClick,
  onReportClick,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-[75vh] font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200/90 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold mb-3 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
          <span>অনলাইন ক্রেতা সচেতনতা ও সুরক্ষা নির্দেশিকা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          অনলাইন কেনাকাটায় নিরাপদ থাকার বাস্তব নির্দেশিকা
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-normal">
          ফেসবুক, টিকটক বা অনলাইনে অগ্রিম টাকা পাঠানোর আগে যে বিষয়গুলো অবশ্যই যাচাই করবেন।
        </p>
      </div>

      {/* Guide 1: Courier Advance Scams */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold text-base">
            ০১
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              "কুরিয়ার অগ্রিম চার্জ" প্রতারণার ফাঁদ (১৫০ – ৫০০ টাকা)
            </h2>
            <p className="text-xs text-slate-500">
              বর্তমানে বাংলাদেশে ফেসবুক ও টিকটকে সবচেয়ে বেশি সংঘটিত অনলাইন প্রতারণা।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-red-100/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
            <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>প্রতারকরা যেভাবে ফাঁদ পাতে</span>
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <li>আসল মূল্যের চেয়ে ৭০% কম দামে গ্যাজেট, জুতো বা পোশাকের স্পন্সরড বিজ্ঞাপন দেয়।</li>
              <li>"সম্পূর্ণ ক্যাশ অন ডেলিভারি" দাবি করলেও কুরিয়ার ফি বাবদ ১৫০–৫০০ টাকা ব্যক্তিগত বিকাশ বা নগদে সেন্ড মানি করতে বলে।</li>
              <li>টাকা পাঠানোর সঙ্গে সঙ্গে ক্রেতাকে ফোন ও ফেসবুক পেজ থেকে ব্লক করে দেয়।</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>নিরাপদ থাকার মূল নিয়ম</span>
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <li>১০০ টাকা হলেও পাঠানোর আগে ScamAlert BD-তে নম্বরটি সার্চ করে অভিযোগ আছে কিনা দেখুন।</li>
              <li>আসল ব্যবসায়ীদের অফিসিয়াল মার্চেন্ট একাউন্ট (পেমেন্ট অপশন) থাকে, ব্যক্তিগত সেন্ড মানি নয়।</li>
              <li>কোনো প্রকার অগ্রিম ডেলিভারি চার্জ না দিয়ে পার্সেল হাতে পেয়ে মূল্য পরিশোধের শর্তে অর্ডার করুন।</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Guide 2: Facebook Page Transparency */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-base">
            ০২
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ফেসবুক "পেজ ট্রান্সপারেন্সি (Page Transparency)" যাচাই
            </h2>
            <p className="text-xs text-slate-500">
              পেজটি কবে খোলা হয়েছে এবং এর আগে কী নাম ছিল তা না দেখে কখনোই বড় অর্ডার করবেন না।
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          <p>
            যেকোনো ফেসবুক পেজে ঢুকে About ট্যাবে গিয়ে নিচে স্ক্রোল করলে <strong>"Page Transparency"</strong> অপশন পাবেন। "See All"-এ ক্লিক করে ৩টি জিনিস লক্ষ্য করুন:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-red-200/80 dark:border-slate-700 shadow-2xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1 text-sm">
                পেজ তৈরির তারিখ
              </span>
              পেজটি যদি গত ৩০–৬০ দিনের মধ্যে তৈরি হয়ে থাকে কিন্তু তারা দাবি করে ১০ বছরের পুরনো প্রতিষ্ঠান, তবে এটি শতভাগ ভুয়া পেজ।
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-red-200/80 dark:border-slate-700 shadow-2xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1 text-sm">
                নাম পরিবর্তনের ইতিহাস
              </span>
              প্রতারকরা পুরনো মিম বা ফান পেজ কিনে নাম বদলে "Fashion BD" বা "Gadget Store" বানিয়ে ফেলে। একাধিকবার নাম বদল বড় বিপদের লক্ষণ।
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-red-200/80 dark:border-slate-700 shadow-2xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1 text-sm">
                অ্যাডমিনদের লোকেশন
              </span>
              পেজটি যারা পরিচালনা করছেন তাদের অবস্থান বাংলাদেশে নাকি বিদেশের কোনো প্রক্সি দেশে তা দেখে নিন।
            </div>
          </div>
        </div>
      </motion.div>

      {/* Guide 3: What to do if you were scammed */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
            জরুরি পদক্ষেপ
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            প্রতারিত হলে দ্রুত যা করণীয়
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            টাকা উদ্ধার বা প্রতারককে শনাক্ত করার জন্য অবিলম্বে এই আইনি ও প্রযুক্তিগত পদক্ষেপগুলো নিন:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="font-bold text-red-400 text-sm block">১. সব কিছুর স্ক্রিনশট রাখুন</span>
            <p className="text-slate-300 leading-relaxed">
              প্রতারক ব্লক করার বা মেসেজ মুছে দেওয়ার আগেই চ্যাটের পুরো স্ক্রিনশট, ফেসবুক পেজের লিংক ও বিকাশ TrxID মেসেজ সেভ করুন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="font-bold text-red-400 text-sm block">২. এমএফএস হেল্পলাইনে কল দিন</span>
            <p className="text-slate-300 leading-relaxed">
              দেরি না করে <strong>বিকাশ (১৬২৪৭)</strong> অথবা <strong>নগদ (১৬১৬৭)</strong> এ কল করে নির্দিষ্ট নম্বরে প্রতারণার রিপোর্ট করুন এবং একাউন্ট ফ্রিজের আবেদন জানান।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="font-bold text-red-400 text-sm block">৩. নিকটস্থ থানায় জিডি করুন</span>
            <p className="text-slate-300 leading-relaxed">
              নিকটস্থ থানায় গিয়ে ট্রানজেকশন স্লিপসহ সাধারণ ডায়েরি (জিডি) করুন অথবা ঢাকা মেট্রোপলিটন পুলিশের (ডিএমপি) অনলাইন জিডি অ্যাপে অভিযোগ দিন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="font-bold text-red-400 text-sm block">৪. ScamAlert BD-তে রিপোর্ট</span>
            <p className="text-slate-300 leading-relaxed">
              আমাদের প্ল্যাটফর্মে নম্বরটি দিয়ে রিপোর্ট জমা দিন, যাতে পরবর্তীতে অন্য কোনো সাধারণ মানুষ ওই নম্বরে টাকা পাঠানোর আগে সতর্ক হতে পারেন।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onReportClick}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
          >
            প্রতারণার অভিযোগ জমা দিন
          </button>
          <button
            onClick={onSearchClick}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            ডাটাবেজ অনুসন্ধান করুন
          </button>
        </div>
      </div>
    </div>
  );
};
