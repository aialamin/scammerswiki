import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { X, Scale, FileText, CheckCircle2, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import { Report } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DisputeModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onDisputeSubmitted: (reportId: string) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  report,
  isOpen,
  onClose,
  onDisputeSubmitted,
}) => {
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantRole, setClaimantRole] = useState('seller');
  const [reason, setReason] = useState('Customer received order / courier delay');
  const [details, setDetails] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.reports.submitDispute(report.reportId, {
        claimantName,
        claimantEmail,
        claimantPhone,
        claimantRole,
        reason,
        details,
        evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
      });

      if (res.success) {
        setSuccess(true);
        toast.success(`রিপোর্ট ${report.reportId} এর বিপরীতে আপত্তি দাখিল হয়েছে।`);
        setTimeout(() => {
          onDisputeSubmitted(report.reportId);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'আপত্তি জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      toast.error(err.message || 'আপত্তি দাখিল ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ব্যবসায়ী বা বিক্রেতার আপত্তি ও আপিল
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              আপত্তি জানানোর রিপোর্ট নম্বর: <span className="font-mono font-bold text-red-600">{report.reportId}</span>
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
              আপত্তি সফলভাবে দাখিল হয়েছে
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-sans leading-relaxed">
              এই অভিযোগের স্ট্যাটাস <strong>"বিক্রেতার আপত্তি দাখিলকৃত"</strong> হিসেবে আপডেট করা হয়েছে। আমাদের সম্পাদকীয় টিম আগামী ৪৮ কর্মঘণ্টার মধ্যে আপনার কুরিয়ার চালান বা প্রমাণপত্র পরীক্ষা করবে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                আপনার পূর্ণ নাম বা প্রতিষ্ঠানের বৈধ প্রতিনিধি *
              </label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="যেমন: ফারহানা আক্তার (স্বত্বাধিকারী)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ইমেইল ঠিকানা *
                </label>
                <input
                  type="email"
                  required
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  placeholder="business@domain.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  যোগাযোগের মোবাইল নম্বর *
                </label>
                <input
                  type="text"
                  required
                  value={claimantPhone}
                  onChange={(e) => setClaimantPhone(e.target.value)}
                  placeholder="০১৭১XXXXXXX"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                আপত্তির প্রধান কারণ *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-sky-500"
              >
                <option value="Customer received order / courier delay">
                  ক্রেতা অর্ডার হাতে পেয়েছেন / কুরিয়ারের কারণে সাময়িক বিলম্ব হয়েছিল
                </option>
                <option value="Full refund already issued to customer">
                  ক্রেতাকে টাকা সম্পূর্ণ রিফান্ড বা ফেরত প্রদান করা হয়েছে
                </option>
                <option value="Impersonation / Someone used our name illegally">
                  পরিচয় চুরি / প্রতারক চক্র আমাদের নাম ও লোগো নকল করে ফেক পেজ খুলেছে
                </option>
                <option value="Malicious or defamatory fake review by competitor">
                  ব্যবসায়িক প্রতিদ্বন্দ্বী অসৎ উদ্দেশ্যে মিথ্যা ও মানহানিকর অভিযোগ দিয়েছে
                </option>
                <option value="Other valid defense">অন্যান্য বৈধ কারণ</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিস্তারিত ব্যাখ্যা ও কুরিয়ার ট্র্যাকিং কোড *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Steadfast, RedX, Pathao বা Paperfly কনসাইনমেন্ট কোড, বিকাশ রিফান্ড স্টেটমেন্ট বা ক্রেতার সাথে সমাধানের বিবরণ দিন..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-sky-500 leading-relaxed font-sans"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ডেলিভারি প্রমাণ / রসিদের লিংক (ঐচ্ছিক)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://... অথবা গুগল ড্রাইভ লিংক"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-sky-500 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'আপত্তি জমা হচ্ছে...' : 'আনুষ্ঠানিক আপত্তি জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
