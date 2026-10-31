import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Info,
  Wallet,
  Truck,
  Facebook,
  PhoneCall,
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.ts';

export const ScamRiskCalculator: React.FC<{ onSearchScenario?: (term: string) => void }> = ({
  onSearchScenario,
}) => {
  // Scenario inputs
  const [advancePayment, setAdvancePayment] = useState<'none' | 'courier_small' | 'partial' | 'full'>('courier_small');
  const [paymentChannel, setPaymentChannel] = useState<'cod' | 'bkash_personal' | 'nagad_personal' | 'merchant_qr' | 'bank'>('bkash_personal');
  const [pageHistory, setPageHistory] = useState<'established' | 'new_under_3m' | 'renamed' | 'no_page'>('new_under_3m');
  const [pricingDiscrepancy, setPricingDiscrepancy] = useState<'normal' | 'suspicious_cheap'>('suspicious_cheap');
  const [courierPolicy, setCourierPolicy] = useState<'open_box' | 'no_open_box'>('no_open_box');

  // Compute Risk Score
  let score = 0;
  const redFlags: string[] = [];
  const safeIndicators: string[] = [];

  // Advance Payment weight
  if (advancePayment === 'full') {
    score += 45;
    redFlags.push('পার্সেল পাঠানোর আগেই ১০০% সম্পূর্ণ মূল্য অগ্রিম দাবি করছে।');
  } else if (advancePayment === 'partial') {
    score += 30;
    redFlags.push('কোনো নিবন্ধিত এসক্রো ছাড়া ২০%–৫০% অগ্রিম বুকিং ফি চাওয়া হচ্ছে।');
  } else if (advancePayment === 'courier_small') {
    score += 25;
    redFlags.push('ব্যক্তিগত সেন্ড মানি করে ১৫০–৫০০ টাকা অগ্রিম কুরিয়ার চার্জ দাবি করা বাংলাদেশের এক নম্বর ফেসবুক প্রতারণার ফাঁদ।');
  } else {
    safeIndicators.push('সম্পূর্ণ ক্যাশ অন ডেলিভারি (কোনো অগ্রিম টাকা দিতে হচ্ছে না)।');
  }

  // Payment Channel weight
  if (paymentChannel === 'bkash_personal' || paymentChannel === 'nagad_personal') {
    score += 25;
    redFlags.push('অফিসিয়াল মার্চেন্ট কিউআর/কাউন্টারের বদলে ব্যক্তিগত "সেন্ড মানি" নম্বরে টাকা চাওয়া হচ্ছে।');
  } else if (paymentChannel === 'merchant_qr') {
    score -= 10;
    safeIndicators.push('ট্রেড লাইসেন্স সম্বলিত ভেরিফাইড বিকাশ/নগদ মার্চেন্ট পেমেন্ট ব্যবহার করা হচ্ছে।');
  }

  // Page History weight
  if (pageHistory === 'new_under_3m') {
    score += 20;
    redFlags.push('ফেসবুক পেজটি মাত্র ৯০ দিনের মধ্যে খোলা হয়েছে (ভুয়া ক্লোন পেজের বৈশিষ্ট্য)।');
  } else if (pageHistory === 'renamed') {
    score += 25;
    redFlags.push('পেজ ট্রান্সপারেন্সিতে পেজের নাম একাধিকবার বদল করার প্রমাণ রয়েছে।');
  } else if (pageHistory === 'established') {
    safeIndicators.push('পেজটি ২ বছরের বেশি সময় ধরে নিয়মিত ব্যবসা পরিচালনা করছে।');
  }

  // Pricing Discrepancy
  if (pricingDiscrepancy === 'suspicious_cheap') {
    score += 15;
    redFlags.push('বাজারদরের চেয়ে ৭০% কমে আকর্ষণীয় পণ্য বিক্রির চটকদার অফার দেওয়া হচ্ছে।');
  }

  // Courier Open Box Inspection
  if (courierPolicy === 'no_open_box') {
    score += 15;
    redFlags.push('ডেলিভারিম্যানের সামনে পার্সেল খুলে পণ্য দেখে নেওয়ার সুযোগ দিতে অস্বীকৃতি জানাচ্ছে।');
  } else {
    safeIndicators.push('পণ্য হাতে পেয়ে দেখে নেওয়ার (ওপেন বক্স ডেলিভারি) সুযোগ রয়েছে।');
  }

  const finalScore = Math.min(99, Math.max(5, score));

  let riskTier: 'critical' | 'moderate' | 'low' = 'low';
  if (finalScore >= 65) riskTier = 'critical';
  else if (finalScore >= 35) riskTier = 'moderate';

  return (
    <div className="py-12 bg-slate-100/50 dark:bg-[#090d16] border-y border-slate-200/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            অ্যালগরিদমিক প্রতারণা নির্ণায়ক
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            তাৎক্ষণিক অনলাইন প্রতারণা ঝুঁকি ক্যালকুলেটর
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-normal">
            বিক্রেতার দেওয়া শর্তগুলো নির্বাচন করে এক নজরে জেনে নিন আপনার অর্ডারে প্রতারিত হওয়ার ঝুঁকি কত শতাংশ।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Field 1: Advance Payment */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 font-sans">
                ১. বিক্রেতা কী ধরনের অগ্রিম টাকা দাবি করছে?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: 'none', label: 'কোনো অগ্রিম নেই (১০০% COD)', desc: 'সবচেয়ে নিরাপদ' },
                  { id: 'courier_small', label: '১৫০–৫০০ টাকা কুরিয়ার চার্জ', desc: 'সবচেয়ে কমন প্রতারণার ফাঁদ' },
                  { id: 'partial', label: '২০%–৫০% বুকিং অ্যাডভান্স', desc: 'উচ্চ আর্থিক ঝুঁকি' },
                  { id: 'full', label: '১০০% সম্পূর্ণ মূল্য অগ্রিম', desc: 'মারাত্মক বিপজ্জনক' },
                ].map((opt) => (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                    onClick={() => setAdvancePayment(opt.id as any)}
                    className={`p-3.5 rounded-xl text-left border transition font-sans ${
                      advancePayment === opt.id
                        ? 'border-red-600 bg-red-100/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-xs'
                        : 'border-red-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{opt.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Field 2: Payment Destination Channel */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 font-sans">
                ২. কোন মাধ্যমে টাকা পরিশোধ করতে বলা হচ্ছে?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: 'bkash_personal', label: 'বিকাশ পার্সোনাল (সেন্ড মানি)', desc: 'ট্রেড লাইসেন্স বা ট্রেস থাকে না' },
                  { id: 'nagad_personal', label: 'নগদ পার্সোনাল ওয়ালেট', desc: 'অজ্ঞাতনামা সিমের ঝুঁকি' },
                  { id: 'merchant_qr', label: 'অফিসিয়াল মার্চেন্ট পেমেন্ট', desc: 'আইনি নিবন্ধিত ব্যবসায়িক কিউআর' },
                  { id: 'cod', label: 'কুরিয়ার ডেলিভারিম্যানকে ক্যাশ', desc: 'পণ্য পাওয়ার পর মূল্য পরিশোধ' },
                ].map((opt) => (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                    onClick={() => setPaymentChannel(opt.id as any)}
                    className={`p-3.5 rounded-xl text-left border transition font-sans ${
                      paymentChannel === opt.id
                        ? 'border-red-600 bg-red-100/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-xs'
                        : 'border-red-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{opt.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Field 3: Page Age and Inspection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 font-sans">
                  ৩. ফেসবুক পেজের বয়স
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'established', label: '২ বছরের বেশি পুরনো পেজ' },
                    { id: 'new_under_3m', label: '৯০ দিনের মধ্যে খোলা নতুন পেজ' },
                    { id: 'renamed', label: 'একাধিকবার নাম বদলানো পেজ' },
                  ].map((opt) => (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -1 }}
                      onClick={() => setPageHistory(opt.id as any)}
                      className={`w-full p-3 rounded-xl text-left border transition font-sans ${
                        pageHistory === opt.id
                          ? 'border-red-600 bg-red-100/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-xs'
                          : 'border-red-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 font-sans">
                  ৪. পার্সেল খুলে দেখার সুযোগ
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'no_open_box', label: 'পার্সেল না খুলে আগে টাকা দিতে হবে' },
                    { id: 'open_box', label: 'রাইডারের সামনে খুলে চেক করা যাবে' },
                  ].map((opt) => (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -1 }}
                      onClick={() => setCourierPolicy(opt.id as any)}
                      className={`w-full p-3 rounded-xl text-left border transition font-sans ${
                        courierPolicy === opt.id
                          ? 'border-red-600 bg-red-100/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-xs'
                          : 'border-red-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Assessment Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ঝুঁকি মূল্যায়ন ফলাফল
                </span>
                <span className="text-xs font-mono text-slate-400">
                  অ্যালগরিদম সংস্করণ ৪.২
                </span>
              </div>

              {/* Gauge Score Display */}
              <div className="text-center py-4">
                <div className="inline-flex items-baseline gap-1">
                  <span
                    className={`text-6xl sm:text-7xl font-black tracking-tight tabular-nums font-sans ${
                      riskTier === 'critical'
                        ? 'text-red-500'
                        : riskTier === 'moderate'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {toBengaliNumber(finalScore)}%
                  </span>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    সম্ভাবনা
                  </span>
                </div>

                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      riskTier === 'critical'
                        ? 'bg-red-950/80 text-red-300 border border-red-800'
                        : riskTier === 'moderate'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {riskTier === 'critical'
                      ? 'চরম প্রতারণার ঝুঁকি (সতর্ক থাকুন)'
                      : riskTier === 'moderate'
                      ? 'মধ্যম সতর্কতা প্রয়োজন'
                      : 'স্বাভাবিক ও নিরাপদ অর্ডার'}
                  </span>
                </div>
              </div>

              {/* Actionable Advice in Bengali */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <div className="font-bold text-slate-200">ক্রেতার প্রতি পরামর্শ:</div>
                {riskTier === 'critical' && (
                  <p className="text-red-300 leading-relaxed font-sans">
                    <strong>সতর্কতা: কোনোভাবেই অগ্রিম টাকা পাঠাবেন না।</strong> ব্যক্তিগত বিকাশ বা নগদে অগ্রিম কুরিয়ার চার্জ পাঠালে ব্লক হওয়ার শতভাগ ঝুঁকি রয়েছে। ডেলিভারি পার্সেল খুলে দেখে ক্যাশ অন ডেলিভারি দিতে রাজি না হলে অর্ডার সঙ্গে সঙ্গে বাতিল করুন।
                  </p>
                )}
                {riskTier === 'moderate' && (
                  <p className="text-amber-300 leading-relaxed font-sans">
                    <strong>সতর্কতা প্রয়োজন।</strong> টাকা পাঠানোর আগে বিক্রেতার ফোন নম্বর ও ফেসবুক পেজ ScamAlert BD ডাটাবেজে সার্চ করুন এবং তাদের আসল দোকান বা ট্রেড লাইসেন্স আছে কিনা যাচাই করুন।
                  </p>
                )}
                {riskTier === 'low' && (
                  <p className="text-emerald-300 leading-relaxed font-sans">
                    <strong>স্বাভাবিক অর্ডার।</strong> শর্তগুলো নিরাপদ ক্যাশ অন ডেলিভারি নির্দেশ করে। তবুও পার্সেল খুলে সঠিক পণ্য বুঝে পেয়ে তবেই ডেলিভারিম্যানকে টাকা দিন।
                  </p>
                )}
              </div>

              {/* Red Flags List */}
              {redFlags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-red-400 tracking-wider block">
                    চিহ্নিত ঝুঁকিসমূহ ({toBengaliNumber(redFlags.length)})
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {redFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="font-sans leading-relaxed">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
