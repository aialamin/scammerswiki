import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  FileText,
  Clock,
  ShieldCheck,
  Scale,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  PlusCircle,
  Upload,
  CheckCircle2,
  Trash2,
  Search,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Report, NotificationItem } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CardSkeleton } from '../components/SkeletonLoader.tsx';
import { formatBDT, formatBengaliDate, toBengaliNumber, CATEGORIES_BN } from '../utils/bengali.ts';

interface UserDashboardPageProps {
  onViewReport: (reportId: string) => void;
  onOpenReportSubmit: () => void;
  onNavigateHome: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  onViewReport,
  onOpenReportSubmit,
  onNavigateHome,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-reports' | 'notifications' | 'settings'>('overview');
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Supplementary evidence state
  const [suppModalOpen, setSuppModalOpen] = useState(false);
  const [targetReportId, setTargetReportId] = useState<string | null>(null);
  const [suppUrl, setSuppUrl] = useState('');
  const [suppSubmitting, setSuppSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repRes, notifRes] = await Promise.all([
        api.reports.getMyReports(),
        api.notifications.getAll(),
      ]);
      if (repRes.success) setMyReports(repRes.reports || []);
      if (notifRes.success) setNotifications(notifRes.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuppEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReportId || !suppUrl) return;
    setSuppSubmitting(true);
    try {
      await api.reports.addEvidence(targetReportId, {
        fileUrl: suppUrl,
        originalFilename: 'Supplementary_Screenshot.png',
      });
      toast.success('অতিরিক্ত প্রমাণপত্র মডারেশন কিউতে জমা হয়েছে।');
      setSuppModalOpen(false);
      setSuppUrl('');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'প্রমাণপত্র জমা দেওয়া সম্ভব হয়নি।');
    } finally {
      setSuppSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4 font-sans">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold">ড্যাশবোর্ড দেখতে অনুগ্রহ করে সাইন ইন করুন</h2>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold"
        >
          মূল পাতায় ফিরুন
        </button>
      </div>
    );
  }

  // Stats calculation
  const totalReports = myReports.length;
  const pendingReports = myReports.filter((r) => r.status === 'pending_review').length;
  const verifiedReports = myReports.filter((r) => r.status === 'verified_incident').length;
  const disputedReports = myReports.filter((r) => r.status === 'disputed').length;

  const roleLabelBn =
    user?.role === 'admin'
      ? 'প্রধান অ্যাডমিন'
      : user?.role === 'moderator'
      ? 'তদন্ত মডারেটর'
      : 'সাধারণ সদস্য';

  const getCategoryLabelBn = (cat: string) => {
    const found = CATEGORIES_BN.find((c) => c.id === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh] font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] text-center">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-red-500/30 mb-3"
            />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {user?.name}
            </h3>
            <p className="text-xs text-slate-500 truncate font-mono">{user?.email}</p>
            <span className="inline-block mt-2 text-[11px] font-bold text-red-600 dark:text-red-400">
              {roleLabelBn}
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="p-2 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold'
                  : 'text-slate-700 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>সারসংক্ষেপ</span>
            </button>

            <button
              onClick={() => setActiveTab('my-reports')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'my-reports'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold'
                  : 'text-slate-700 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>আমার দাখিলকৃত রিপোর্ট</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-sans border border-red-200/60 dark:border-slate-700">
                {toBengaliNumber(myReports.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'notifications'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold'
                  : 'text-slate-700 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4" />
                <span>বিজ্ঞপ্তিসমূহ</span>
              </div>
              {notifications.some((n) => !n.isRead) && (
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'settings'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold'
                  : 'text-slate-700 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>প্রোফাইল সেটিংস</span>
            </button>

            <div className="border-t border-red-100 dark:border-slate-800 my-1"></div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-100/60 dark:hover:bg-red-950/30 transition font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 font-sans">
                    মোট দাখিলকৃত
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                    {toBengaliNumber(totalReports)}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 shadow-[0_2px_10px_-2px_rgba(180,83,9,0.06)]">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1 font-sans">
                    তদন্তাধীন / অপেক্ষমাণ
                  </span>
                  <div className="text-2xl font-black text-amber-900 dark:text-amber-200 font-sans">
                    {toBengaliNumber(pendingReports)}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-900/60 shadow-[0_2px_10px_-2px_rgba(16,185,129,0.06)]">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1 font-sans">
                    যাচাইকৃত রিপোর্ট
                  </span>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 font-sans">
                    {toBengaliNumber(verifiedReports)}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/90 dark:border-sky-900/60 shadow-[0_2px_10px_-2px_rgba(2,132,199,0.06)]">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 block mb-1 font-sans">
                    আপত্তি দাখিলকৃত
                  </span>
                  <div className="text-2xl font-black text-sky-900 dark:text-sky-200 font-sans">
                    {toBengaliNumber(disputedReports)}
                  </div>
                </div>
              </div>

              {/* Quick Action Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-red-600/20">
                <div>
                  <h3 className="font-extrabold text-lg">নতুন কোনো সন্দেহজনক বিক্রেতার রিপোর্ট করতে চান?</h3>
                  <p className="text-xs text-red-100 mt-0.5">
                    আপনার সচেতনতা অন্যান্য ক্রেতাদের আর্থিক ক্ষতি এড়াতে সহায়তা করবে।
                  </p>
                </div>
                <button
                  onClick={onOpenReportSubmit}
                  className="px-5 py-2.5 rounded-xl bg-white text-red-600 text-xs font-bold hover:bg-red-50 transition shadow"
                >
                  নতুন অভিযোগ দাখিল
                </button>
              </div>

              {/* Recent User Reports Table */}
              <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    আমার সাম্প্রতিক দাখিলসমূহ
                  </h3>
                  <button
                    onClick={() => setActiveTab('my-reports')}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                  >
                    সবগুলো দেখুন
                  </button>
                </div>

                {myReports.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    আপনি এখনও পর্যন্ত কোনো অভিযোগ জমা দেননি।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReports.slice(0, 3).map((rep) => (
                      <div
                        key={rep.id || rep.reportId}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold">{rep.reportId}</span>
                            <StatusBadge status={rep.status} size="sm" />
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                            {rep.productOrService} – {formatBDT(rep.transactionAmount)} টাকা
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setTargetReportId(rep.reportId);
                              setSuppModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-bold"
                          >
                            + প্রমাণ যুক্ত করুন
                          </button>
                          <button
                            onClick={() => onViewReport(rep.reportId)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px]"
                          >
                            দেখুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY REPORTS */}
          {activeTab === 'my-reports' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    আমার দাখিলকৃত অভিযোগসমূহ
                  </h2>
                  <p className="text-xs text-slate-500">
                    স্ট্যাটাস ট্র্যাক করুন, সম্পূরক প্রমাণ যোগ করুন অথবা বিস্তারিত দেখুন।
                  </p>
                </div>
                <button
                  onClick={onOpenReportSubmit}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  + নতুন অভিযোগ
                </button>
              </div>

              {myReports.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
                  <p className="text-sm text-slate-500">আপনি এখনও কোনো রিপোর্ট দাখিল করেননি।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReports.map((rep) => (
                    <div
                      key={rep.id || rep.reportId}
                      className="p-5 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-3 text-xs font-sans"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">{rep.reportId}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-red-200/60 dark:border-slate-700">
                            {getCategoryLabelBn(rep.category)}
                          </span>
                          <StatusBadge status={rep.status} size="sm" />
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          দাখিলের তারিখ: {formatBengaliDate(rep.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-white/80 dark:bg-slate-800/40 border border-red-200/60 dark:border-slate-700 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-medium">পণ্য বা সেবা</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {rep.productOrService}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">ক্ষতি</span>
                          <span className="font-bold text-red-600 font-sans">
                            {formatBDT(rep.transactionAmount)} টাকা
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">অন্যান্য ভুক্তভোগী</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                            {toBengaliNumber(rep.corroboratingCount || 1)} জন
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">প্রমাণপত্র</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                            {toBengaliNumber(rep.evidenceFiles?.length || 0)}টি ফাইল
                          </span>
                        </div>
                      </div>

                      {rep.reviewNotes && (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-[11px] font-sans border border-amber-200/70 dark:border-amber-900/50">
                          <strong>মডারেশন নোট:</strong> {rep.reviewNotes}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setTargetReportId(rep.reportId);
                            setSuppModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-red-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-transparent hover:bg-red-50 font-bold text-xs"
                        >
                          + আরও প্রমাণপত্র দিন
                        </button>
                        <button
                          onClick={() => onViewReport(rep.reportId)}
                          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
                        >
                          বিস্তারিত দেখুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4 animate-in fade-in font-sans">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  বিজ্ঞপ্তিসমূহ ও কেস আপডেট
                </h3>
                <button
                  onClick={async () => {
                    await api.notifications.markAllRead();
                    loadData();
                  }}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                  সবগুলো পঠিত চিহ্নিত করুন
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  এখন পর্যন্ত কোনো নতুন বিজ্ঞপ্তি নেই।
                </div>
              ) : (
                <div className="divide-y divide-red-100 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 flex items-start justify-between gap-3 text-xs ${
                        !n.isRead ? 'bg-red-100/60 dark:bg-red-950/20 rounded-xl' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {n.title}
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 font-sans">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {formatBengaliDate(n.createdAt)}
                        </span>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={async () => {
                            await api.notifications.markAsRead(n.id);
                            loadData();
                          }}
                          className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold"
                        >
                          পঠিত
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-6 animate-in fade-in text-xs font-sans">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                প্রোফাইল ও গোপনীয়তা সেটিংস
              </h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block font-semibold mb-1">প্রদর্শনীয় নাম</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email}
                    className="w-full px-3 py-2 rounded-xl bg-red-100/50 dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 text-xs text-slate-500 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => toast.success('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে।')}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    পরিবর্তন সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supplementary Evidence Modal */}
      <AnimatePresence>
        {suppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl"
            >
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                অতিরিক্ত প্রমাণপত্র সংযুক্ত করুন
              </h3>
              <p className="text-slate-500 text-[11px]">
                রিপোর্ট নম্বর{' '}
                <span className="font-mono font-bold text-red-600">{targetReportId}</span> এর জন্য আরও স্ক্রিনশট বা রসিদ দিন।
              </p>

              <form onSubmit={handleAddSuppEvidence} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">স্ক্রিনশট বা ছবির ওয়েব লিংক</label>
                  <input
                    type="url"
                    required
                    value={suppUrl}
                    onChange={(e) => setSuppUrl(e.target.value)}
                    placeholder="https://... অথবা ক্লাউড লিংক"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSuppModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={suppSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition disabled:opacity-50"
                  >
                    {suppSubmitting ? 'আপলোড হচ্ছে...' : 'প্রমাণ জমা দিন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
