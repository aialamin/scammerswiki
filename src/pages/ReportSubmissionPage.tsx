import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Trash2,
  FileText,
  Phone,
  MessageSquare,
  Facebook,
  Globe,
  Wallet,
  Smartphone,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.ts';
import { ReportCategory } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { formatBDT, toBengaliNumber, PAYMENT_METHODS_BN, CATEGORIES_BN } from '../utils/bengali.ts';
import { normalizeBDPhone } from '../utils/normalizerClient.ts';

interface ReportSubmissionPageProps {
  onReportCreated: (reportId: string) => void;
  onNavigateHome: () => void;
}

export const ReportSubmissionPage: React.FC<ReportSubmissionPageProps> = ({
  onReportCreated,
  onNavigateHome,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Step 1: Category
  const [category, setCategory] = useState<ReportCategory>('bkash');

  // Step 2: Identifiers
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [facebookPageName, setFacebookPageName] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [rocketNumber, setRocketNumber] = useState('');

  // Step 3: Incident Details
  const [productOrService, setProductOrService] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('bKash Send Money');
  const [transactionReference, setTransactionReference] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  // Step 4: Evidence
  const [evidenceFiles, setEvidenceFiles] = useState<Array<{ name: string; url: string; size: number }>>([]);

  // Step 5: Confirmation & Submitter Details
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [truthConfirmation, setTruthConfirmation] = useState(false);

  // Categories config with icons
  const categoryCards = [
    { id: 'bkash', label: 'বিকাশ নম্বর', icon: Wallet, desc: 'ভুয়া কুরিয়ার ফি বা অগ্রিম সেন্ড মানি' },
    { id: 'nagad', label: 'নগদ নম্বর', icon: Smartphone, desc: 'পার্সোনাল সেন্ড মানি বা ভুয়া ওয়ালেট' },
    { id: 'facebook', label: 'ফেসবুক পেজ', icon: Facebook, desc: 'প্রতারক ফেসবুক অনলাইন শপ বা ক্লোন পেজ' },
    { id: 'phone', label: 'মোবাইল নম্বর', icon: Phone, desc: 'সন্দেহভাজন বিক্রেতা বা কলার নম্বর' },
    { id: 'whatsapp', label: 'হোয়াটসঅ্যাপ', desc: 'টেলিগ্রাম কাজের ফাঁদ বা মেসেজ প্রতারণা' },
    { id: 'rocket', label: 'রকেট (DBBL)', icon: Wallet, desc: 'ডাচ-বাংলা মোবাইল ব্যাংকিং একাউন্ট' },
    { id: 'website', label: 'ওয়েবসাইট', desc: 'ভুয়া ই-কমার্স বা ফিশিং পেমেন্ট লিঙ্ক' },
    { id: 'other', label: 'অন্যান্য মাধ্যম', icon: ShieldAlert, desc: 'অন্য যেকোনো অনলাইন প্রতারণা' },
  ];

  // Live validation for BD Phone / MFS
  const activeNumber = bkashNumber || nagadNumber || rocketNumber || phone;
  const phoneCheck = normalizeBDPhone(activeNumber);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let addedCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" ফাইলটির সাইজ ১০ মেগাবাইটের বেশি।`);
        continue;
      }
      const objectUrl = URL.createObjectURL(file);
      setEvidenceFiles((prev) => [
        ...prev,
        {
          name: file.name,
          url: objectUrl,
          size: file.size,
        },
      ]);
      addedCount++;
    }
    if (addedCount > 0) {
      toast.success(`${toBengaliNumber(addedCount)}টি প্রমাণপত্র সংযুক্ত হয়েছে।`);
    }
  };

  const handleAddSampleEvidence = () => {
    setEvidenceFiles((prev) => [
      ...prev,
      {
        name: 'bKash_Statement_Receipt_01.png',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        size: 342000,
      },
      {
        name: 'WhatsApp_Chat_Blocked_Proof.png',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        size: 412000,
      },
    ]);
    toast.success('নমুনা যাচাইকরণ প্রমাণপত্র সফলভাবে যুক্ত হয়েছে।');
  };

  const removeEvidence = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info('প্রমাণপত্র মুছে ফেলা হয়েছে।');
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    if (currentStep === 1) {
      if (!category) {
        const msg = 'অনুগ্রহ করে প্রতারণার প্রধান মাধ্যমটি নির্বাচন করুন।';
        setError(msg);
        toast.error(msg);
        return false;
      }
    }
    if (currentStep === 2) {
      const hasAnyIdentifier =
        phone ||
        whatsapp ||
        facebookPageName ||
        facebookUrl ||
        websiteUrl ||
        bkashNumber ||
        nagadNumber ||
        rocketNumber;
      if (!hasAnyIdentifier) {
        const msg = 'কমপক্ষে একটি শনাক্তকরণ তথ্য (ফোন নম্বর, ফেসবুক পেজ বা বিকাশ নম্বর) দিন।';
        setError(msg);
        toast.error(msg);
        return false;
      }
    }
    if (currentStep === 3) {
      if (!productOrService.trim()) {
        const msg = 'অর্ডারকৃত পণ্য বা সেবার নাম লিখুন।';
        setError(msg);
        toast.error(msg);
        return false;
      }
      if (!transactionAmount || Number(transactionAmount) <= 0) {
        const msg = 'টাকা বা ক্ষতির পরিমাণ উল্লেখ করুন।';
        setError(msg);
        toast.error(msg);
        return false;
      }
      if (!incidentDescription.trim() || incidentDescription.trim().length < 15) {
        const msg = 'ঘটনার বিবরণ সংক্ষেপে লিখুন (কমপক্ষে ১৫ অক্ষর)।';
        setError(msg);
        toast.error(msg);
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1));
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    if (!truthConfirmation) {
      const msg = 'তথ্য সত্য ও সঠিক হওয়ার অঙ্গীকার বক্সে টিক চিহ্ন দিন।';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        category,
        phone,
        whatsapp,
        facebookPageName,
        facebookUrl,
        websiteUrl,
        bkashNumber,
        nagadNumber,
        rocketNumber,
        productOrService,
        transactionAmount: Number(transactionAmount),
        transactionDate,
        paymentMethod,
        transactionReference,
        incidentDescription,
        isAnonymous,
        reporterName: reporterName || user?.name || 'নাম প্রকাশে অনিচ্ছুক নাগরিক',
        reporterEmail: reporterEmail || user?.email || 'anonymous@scamalertbd.com',
        evidenceUrls: evidenceFiles.map((f) => f.url),
      };

      const res = await api.reports.create(payload);
      if (res.success && res.reportId) {
        setSubmittedReportId(res.reportId);
        toast.success(`রিপোর্ট ${res.reportId} সফলভাবে দাখিল হয়েছে!`);
      }
    } catch (err: any) {
      const msg = err.message || 'রিপোর্ট জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh] font-sans">
      {/* Success View */}
      {submittedReportId ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
              অভিযোগটি সফলভাবে গৃহীত হয়েছে
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              বাংলাদেশি ক্রেতাদের সতর্ক করায় আপনাকে ধন্যবাদ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
              আপনার অভিযোগের ট্র্যাকিং আইডি:{' '}
              <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-800">
                {submittedReportId}
              </span>
              । এটি বর্তমানে তদন্ত ও মডারেশন দলের পর্যালোচনায় রয়েছে।
            </p>
          </div>

          <div className="p-4 max-w-md mx-auto rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-red-200/80 dark:border-slate-700/80 text-left text-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>পরবর্তী পদক্ষেপ কী?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li>আমাদের মডারেশন টিম ট্রানজেকশন আইডি ও স্ক্রিনশট যাচাই করবে।</li>
              <li>যাচাই সম্পন্ন হলে এই নম্বর বা পেজ সার্চ করলেই যে কেউ সতর্কবার্তা দেখতে পাবেন।</li>
              <li>আপনার ব্যক্তিগত নাম ও পরিচয় সম্পূর্ণ সুরক্ষিত ও গোপন রাখা হবে।</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onReportCreated(submittedReportId)}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
            >
              রিপোর্টের বর্তমান অবস্থা দেখুন
            </button>
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 text-slate-800 dark:text-slate-200 font-bold text-xs transition border border-red-200/80 dark:border-slate-700"
            >
              মূল পাতায় ফিরুন
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>সহজ ও দ্রুত রিপোর্ট দাখিল</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              প্রতারক বিক্রেতা বা অ্যাকাউন্টের বিরুদ্ধে অভিযোগ
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              প্রমাণপত্র সংযুক্ত করে অভিযোগ জানান এবং অন্যদের আর্থিক ক্ষতি থেকে রক্ষা করুন।
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold text-slate-500 mb-2">
              <span className={step >= 1 ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                ১. মাধ্যম নির্বাচন
              </span>
              <span className={step >= 2 ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                ২. বিক্রেতার তথ্য
              </span>
              <span className={step >= 3 ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                ৩. লেনদেনের বিবরণ
              </span>
              <span className={step >= 4 ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                ৪. প্রমাণপত্র
              </span>
              <span className={step >= 5 ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                ৫. পর্যালোচনা
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden max-w-2xl mx-auto">
              <div
                className="bg-red-600 h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 max-w-2xl mx-auto p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Multi-Step Content with Fluid Transitions */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] max-w-2xl mx-auto space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                    ধাপ ১: প্রতারণার প্রধান মাধ্যম নির্বাচন করুন
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                    প্রতারক মূলত কোন অ্যাকাউন্টে টাকা নিয়েছে বা কোন প্ল্যাটফর্মের মাধ্যমে যোগাযোগ করেছিল?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryCards.map((c) => {
                    const Icon = c.icon || ShieldAlert;
                    const isSelected = category === c.id;
                    return (
                      <motion.div
                        key={c.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCategory(c.id as ReportCategory)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 font-sans ${
                          isSelected
                            ? 'border-red-600 bg-red-100/70 dark:bg-red-950/40 shadow-xs'
                            : 'border-red-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900 shadow-2xs'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl shrink-0 transition-transform ${
                            isSelected
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-red-100/70 dark:bg-slate-800 text-red-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${isSelected ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>
                            {c.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{c.desc}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Seller Information */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] max-w-2xl mx-auto space-y-5 text-xs"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    ধাপ ২: বিক্রেতার যোগাযোগের তথ্য
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আপনার কাছে যে তথ্যগুলো রয়েছে সেগুলো লিখুন। একাধিক নম্বর থাকলে লিখে দিতে পারেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category-prioritized fields */}
                  {category === 'bkash' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/60">
                      <label className="block font-bold text-pink-700 dark:text-pink-300 mb-1">
                        বিকাশ অ্যাকাউন্ট নম্বর (টাকা পাঠানোর নম্বর) *
                      </label>
                      <input
                        type="text"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        placeholder="০১XXXXXXXXX"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-pink-300 dark:border-pink-800 outline-none font-mono"
                      />
                    </div>
                  )}

                  {category === 'nagad' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/60">
                      <label className="block font-bold text-orange-700 dark:text-orange-300 mb-1">
                        নগদ অ্যাকাউন্ট নম্বর (টাকা পাঠানোর নম্বর) *
                      </label>
                      <input
                        type="text"
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                        placeholder="০১XXXXXXXXX"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 outline-none font-mono"
                      />
                    </div>
                  )}

                  {category === 'rocket' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60">
                      <label className="block font-bold text-purple-700 dark:text-purple-300 mb-1">
                        রকেট নম্বর (১১ বা ১২ ডিজিট) *
                      </label>
                      <input
                        type="text"
                        value={rocketNumber}
                        onChange={(e) => setRocketNumber(e.target.value)}
                        placeholder="০১৯XXXXXXXXX"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 outline-none font-mono"
                      />
                    </div>
                  )}

                  {category !== 'bkash' && (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        বিকাশ নম্বর (যদি থাকে)
                      </label>
                      <input
                        type="text"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        placeholder="০১XXXXXXXXX"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 font-mono"
                      />
                    </div>
                  )}

                  {category !== 'nagad' && (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        নগদ নম্বর (যদি থাকে)
                      </label>
                      <input
                        type="text"
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                        placeholder="০১XXXXXXXXX"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      মোবাইল নম্বর (কথা বলার নম্বর)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="০১৭১XXXXXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      হোয়াটসঅ্যাপ নম্বর
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="০১XXXXXXXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ফেসবুক পেজের নাম বা হ্যান্ডেল
                    </label>
                    <input
                      type="text"
                      value={facebookPageName}
                      onChange={(e) => setFacebookPageName(e.target.value)}
                      placeholder="যেমন: Gadget Mart BD বা @gadgetmartbd"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ফেসবুক পেজ লিংক বা ওয়েবসাইট (যদি থাকে)
                    </label>
                    <input
                      type="text"
                      value={facebookUrl || websiteUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('facebook') || val.includes('fb.com')) {
                          setFacebookUrl(val);
                        } else {
                          setWebsiteUrl(val);
                        }
                      }}
                      placeholder="https://facebook.com/... বা ডোমেইন নাম"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Incident Details */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] max-w-2xl mx-auto space-y-5 text-xs"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    ধাপ ৩: লেনদেন ও ঘটনার বিবরণ
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    কত টাকা পাঠিয়েছেন এবং কী পণ্য কেনার সময় প্রতারণার শিকার হয়েছেন তা উল্লেখ করুন।
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    অর্ডারকৃত পণ্য বা সেবার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={productOrService}
                    onChange={(e) => setProductOrService(e.target.value)}
                    placeholder="যেমন: আইফোন ১৫, স্নিকার জুতো, থ্রি-পিস, অনলাইন পার্ট-টাইম কাজ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ক্ষতি বা লেনদেনের পরিমাণ (টাকায়) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        placeholder="যেমন: ৪৫০০"
                        className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 font-bold"
                      />
                    </div>
                    {transactionAmount && Number(transactionAmount) > 0 && (
                      <span className="text-[11px] text-red-600 dark:text-red-400 font-bold mt-1 block">
                        = {formatBDT(transactionAmount)} টাকা
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      লেনদেনের তারিখ *
                    </label>
                    <input
                      type="date"
                      required
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      টাকা পাঠানোর মাধ্যম
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500"
                    >
                      {PAYMENT_METHODS_BN.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="যেমন: BK9X8721LA বা 7NA99102X"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    কী ঘটেছিল সংক্ষেপে লিখুন *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    placeholder="কীভাবে যোগাযোগ হলো, কত টাকা অগ্রিম চাইল, টাকা পাঠানোর পর কীভাবে ব্লক করল বা পণ্য না দিয়ে কী আচরণ করল তা বিস্তারিত লিখুন..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-red-500 leading-relaxed font-sans"
                  ></textarea>
                </div>
              </motion.div>
            )}

            {/* Step 4: Evidence Upload */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] max-w-2xl mx-auto space-y-5 text-xs"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    ধাপ ৪: প্রমাণপত্র ও স্ক্রিনশট সংযুক্ত করুন
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    টাকা পাঠানোর এসএমএস, বিকাশ স্টেটমেন্ট বা চ্যাট স্ক্রিনশট দিন। প্রমাণের গোপনীয়তা সম্পূর্ণ সুরক্ষিত থাকবে।
                  </p>
                </div>

                {/* Drag and Drop Box */}
                <div className="border-2 border-dashed border-red-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-red-500 dark:hover:border-red-500 transition cursor-pointer relative bg-white/70 dark:bg-slate-800/40">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করতে ক্লিক করুন
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ছবি বা পিডিএফ ফরম্যাট (JPG, PNG, WEBP, PDF), সর্বোচ্চ ১০ মেগাবাইট
                  </p>
                </div>

                {/* Sample files shortcut for quick testing */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-red-200/60 dark:border-slate-700">
                  <span className="text-slate-500 text-[11px]">
                    এখনই স্ক্রিনশট নেই? সহজে টেস্ট করতে চান?
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSampleEvidence}
                    className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>নমুনা প্রমাণপত্র যুক্ত করুন</span>
                  </button>
                </div>

                {/* Uploaded Files Preview */}
                {evidenceFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      সংযুক্ত ফাইলসমূহ ({toBengaliNumber(evidenceFiles.length)}টি)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {evidenceFiles.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="truncate text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                              {f.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEvidence(i)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Review & Confirm */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] max-w-2xl mx-auto space-y-6 text-xs"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    ধাপ ৫: চূড়ান্ত পর্যালোচনা ও জমা দান
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আপনার তথ্যের সঠিকতা যাচাই করুন। আপনার পরিচয় চাইলে সম্পূর্ণ গোপন রাখা সম্ভব।
                  </p>
                </div>

                {/* Report Summary Card */}
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-red-200/80 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-red-100 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">
                      প্রতারণার মাধ্যম
                    </span>
                    <span className="font-bold uppercase text-red-600 dark:text-red-400">
                      {CATEGORIES_BN.find((c) => c.id === category)?.label || category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">পণ্য বা সেবা</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {productOrService}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ক্ষতির পরিমাণ</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {formatBDT(transactionAmount)} টাকা
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">পেমেন্ট মাধ্যম</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {paymentMethod}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">সংযুক্ত প্রমাণপত্র</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {toBengaliNumber(evidenceFiles.length)}টি ফাইল সংযুক্ত
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] mb-1">ঘটনার সারাংশ</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic line-clamp-3">
                      "{incidentDescription}"
                    </p>
                  </div>
                </div>

                {/* Reporter Privacy Options */}
                <div className="p-4 rounded-xl bg-red-50/70 dark:bg-slate-800/80 border border-red-200/70 dark:border-slate-700 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      নাম প্রকাশ না করে অজ্ঞাতনামা হিসেবে রিপোর্ট করুন (পাবলিক রেকর্ড থেকে আপনার নাম গোপন থাকবে)
                    </span>
                  </label>

                  {!isAuthenticated && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1 font-semibold">আপনার নাম</label>
                        <input
                          type="text"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          placeholder="তানভীর আহমেদ"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1 font-semibold">আপনার ইমেইল (প্রয়োজনে যোগাযোগে ব্যবহৃত হবে)</label>
                        <input
                          type="email"
                          value={reporterEmail}
                          onChange={(e) => setReporterEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Legal Truth Affirmation Checkbox */}
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={truthConfirmation}
                      onChange={(e) => setTruthConfirmation(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 shrink-0"
                    />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      <strong>আমি শপথ করে নিশ্চয়তা দিচ্ছি</strong> যে উপরোল্লিখিত সকল তথ্য ও প্রমাণপত্র সত্য এবং আমার বাস্তব লেনদেনের ওপর ভিত্তি করে পেশ করা হয়েছে। উদ্দেশ্যপ্রণোদিতভাবে নির্দোষ কোনো বিক্রেতার বিরুদ্ধে অসত্য বা মানহানিকর তথ্য প্রদান বাংলাদেশের প্রচলিত ডিজিটাল নিরাপত্তা আইনে দণ্ডনীয় অপরাধ।
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between max-w-2xl mx-auto">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী ধাপ</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
              >
                <span>পরবর্তী ধাপ ({toBengaliNumber(step + 1)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || !truthConfirmation}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold shadow-xl shadow-red-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>ডাটাবেজে যুক্ত হচ্ছে...</span>
                ) : (
                  <>
                    <span>অভিযোগ জমা দিন</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
