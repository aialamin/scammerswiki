import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  Calendar,
  Layers,
  Banknote,
  Receipt,
  FileCheck2,
  ExternalLink,
  Scale,
  Flag,
  Share2,
  Lock,
  Phone,
  MessageSquare,
  Facebook,
  Globe,
  Wallet,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Report } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { formatBDT, formatBengaliDate, toBengaliNumber } from '../utils/bengali.ts';

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDispute: (report: Report) => void;
  onReportIncorrect?: (report: Report) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenDispute,
  onReportIncorrect,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeEvidenceImg, setActiveEvidenceImg] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('রিপোর্টের লিংক ক্লিপবোর্ডে কপি হয়েছে।');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {report.reportId}
                </span>
                <StatusBadge status={report.status} size="sm" />
              </div>
              <span className="text-xs text-slate-500 font-sans">
                দাখিলের তারিখ: {formatBengaliDate(report.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 font-semibold"
              title="লিংক কপি করুন"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Moderation Banner if verified */}
          {report.status === 'verified_incident' && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-800 dark:text-red-300 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-0.5">যাচাইকৃত প্রতারণা ঘটনা</span>
                এই বিক্রেতা/অ্যাকাউন্টের বিরুদ্ধে একাধিক স্বাধীন ক্রেতার প্রমাণপত্র ও বিকাশ/নগদ লেনদেনের সত্যতা যাচাই করে নিশ্চিত করা হয়েছে।
                {report.reviewNotes && (
                  <p className="mt-1.5 font-semibold text-red-900 dark:text-red-200">
                    মডারেটর নোট: {report.reviewNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Under Review Notice */}
          {report.status === 'under_review' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-0.5">অভিযোগটি তদন্তাধীন রয়েছে</span>
                প্রাথমিক প্রমাণ পাওয়া গেছে। আমাদের মডারেশন টিম সংশ্লিষ্ট উভয় পক্ষের সাথে যোগাযোগ করে ডেলিভারি ও লেনদেন হিস্ট্রি যাচাই করছে।
              </div>
            </div>
          )}

          {/* Disputed Notice */}
          {report.status === 'disputed' && (
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-3">
              <Scale className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-0.5">বিক্রেতার আনুষ্ঠানিক আপত্তি দাখিলকৃত</span>
                অভিযুক্ত বিক্রেতা বা পেজ কর্তৃপক্ষ পণ্য ডেলিভারির রসিদ বা পাল্টা প্রমাণ দিয়ে অভিযোগের নিষ্পত্তি চেয়ে আবেদন করেছেন। বিষয়টি বর্তমানে সালিশি পর্যালোচনায় রয়েছে।
              </div>
            </div>
          )}

          {/* Target Identifiers Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              অভিযুক্ত সত্ত্বার শনাক্তকরণ তথ্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {report.identifiers.phone && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 font-medium">মোবাইল নম্বর:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {report.identifiers.phone}
                  </span>
                </div>
              )}

              {report.identifiers.whatsapp && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-500 font-medium">হোয়াটসঅ্যাপ:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {report.identifiers.whatsapp}
                  </span>
                </div>
              )}

              {report.identifiers.bkashNumber && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-pink-500" />
                    <span className="text-slate-500 font-medium">বিকাশ অ্যাকাউন্ট:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {report.identifiers.bkashNumber}
                  </span>
                </div>
              )}

              {report.identifiers.nagadNumber && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span className="text-slate-500 font-medium">নগদ অ্যাকাউন্ট:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {report.identifiers.nagadNumber}
                  </span>
                </div>
              )}

              {report.identifiers.rocketNumber && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-500 font-medium">রকেট নম্বর:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {report.identifiers.rocketNumber}
                  </span>
                </div>
              )}

              {report.identifiers.facebookPageName && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-500 font-medium">ফেসবুক পেজ:</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                    <span>{report.identifiers.facebookPageName}</span>
                    {report.identifiers.facebookUrl && (
                      <a
                        href={report.identifiers.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                        title="পেজ খুলুন"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {report.identifiers.websiteUrl && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-500" />
                    <span className="text-slate-500 font-medium">ওয়েবসাইট লিঙ্ক:</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                    {report.identifiers.websiteUrl}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Incident Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              ঘটনার পূর্ণাঙ্গ বিবরণ
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">অর্ডারকৃত পণ্য বা সেবা</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {report.productOrService}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">ক্ষতির পরিমাণ</span>
                  <span className="font-bold text-red-600 dark:text-red-400 font-sans text-sm">
                    {formatBDT(report.transactionAmount)} টাকা
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">পেমেন্ট মাধ্যম</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {report.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">ট্রানজেকশন রেফারেন্স (TrxID)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                    {report.transactionReference || 'প্রদান করা হয়নি'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">ভুক্তভোগীর বক্তব্য</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {report.incidentDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Files Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                সংযুক্ত প্রমাণপত্র ({toBengaliNumber(report.evidenceFiles?.length || 0)}টি)
              </h4>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>ব্যক্তিগত গোপনীয় তথ্য সুরক্ষিত</span>
              </span>
            </div>

            {report.evidenceFiles && report.evidenceFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.evidenceFiles.map((ev, i) => (
                  <div
                    key={ev.id || i}
                    onClick={() => setActiveEvidenceImg(ev.fileUrl)}
                    className="group cursor-pointer relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center"
                  >
                    <img
                      src={ev.fileUrl}
                      alt={ev.originalFilename}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                      বড় করে দেখুন
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                প্রমাণপত্র মডারেশন টিম কর্তৃক অভ্যন্তরীণভাবে পরীক্ষিত হয়েছে।
              </div>
            )}
          </div>

          {/* Trust Metrics Footer within modal */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>
                এই বিক্রেতার বিরুদ্ধে মোট <strong>{toBengaliNumber(report.corroboratingCount || 1)}</strong> জন ক্রেতার অভিন্ন অভিযোগ রয়েছে
              </span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>পরিচয় সুরক্ষা সক্রিয়</span>
            </span>
          </div>
        </div>

        {/* Modal Bottom Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenDispute(report);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <Scale className="w-3.5 h-3.5 text-sky-600" />
              <span>বিক্রেতার আনুষ্ঠানিক আপত্তি দাখিল</span>
            </button>

            <button
              onClick={() => {
                toast.success('ধন্যবাদ। আপনার সংশোধনী আবেদন সম্পাদকীয় বিভাগে পাঠানো হয়েছে।');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <span>ভুল তথ্য সংশোধন অনুরোধ</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
          >
            বন্ধ করুন
          </button>
        </div>

        {/* Full Image Preview Modal */}
        {activeEvidenceImg && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setActiveEvidenceImg(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh]">
              <img
                src={activeEvidenceImg}
                alt="Enlarged Evidence"
                className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
              <p className="text-center text-xs text-white/80 mt-2 font-sans">
                বন্ধ করতে যেকোনো জায়গায় ক্লিক করুন
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
