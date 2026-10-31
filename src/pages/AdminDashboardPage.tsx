import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  Users,
  FileText,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit3,
  Search,
  Filter,
  Eye,
  ExternalLink,
  ChevronRight,
  Sliders,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Report, Dispute, AuditLogItem, User, Statistics } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { TableRowSkeleton } from '../components/SkeletonLoader.tsx';
import { formatBDT, formatBengaliDate, toBengaliNumber, CATEGORIES_BN } from '../utils/bengali.ts';

interface AdminDashboardPageProps {
  onViewReport: (reportId: string) => void;
  onNavigateHome: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onViewReport,
  onNavigateHome,
}) => {
  const { user, isModerator, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'queue' | 'disputes' | 'all-reports' | 'users' | 'audit'>('queue');
  const [stats, setStats] = useState<Statistics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Moderation action modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionStatus, setActionStatus] = useState<string>('verified_incident');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Dispute resolution modal state
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeResolutionStatus, setDisputeResolutionStatus] = useState<string>('resolved_upheld');
  const [disputeAdminNote, setDisputeAdminNote] = useState<string>('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Redaction / edit modal state
  const [editModalReport, setEditModalReport] = useState<Report | null>(null);
  const [editProduct, setEditProduct] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (isModerator) {
      loadAllAdminData();
    }
  }, [isModerator]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, disputesRes, auditRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getReports(),
        api.admin.getDisputes(),
        api.admin.getAuditLogs(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (reportsRes.success) setReports(reportsRes.reports || []);
      if (disputesRes.success) setDisputes(disputesRes.disputes || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);

      if (isAdmin) {
        const usersRes = await api.admin.getUsers();
        if (usersRes.success) setUsersList(usersRes.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyModeration = async () => {
    if (!selectedReport) return;
    setActionSubmitting(true);
    try {
      await api.admin.updateReportStatus(selectedReport.reportId, {
        status: actionStatus,
        reviewNotes,
        rejectionReason: actionStatus === 'rejected' ? rejectionReason : undefined,
      });
      toast.success(`রিপোর্ট ${selectedReport.reportId} এর স্ট্যাটাস সফলভাবে আপডেট হয়েছে।`);
      setSelectedReport(null);
      setReviewNotes('');
      setRejectionReason('');
      loadAllAdminData();
    } catch (e: any) {
      toast.error(e.message || 'স্ট্যাটাস আপডেট করা যায়নি।');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    setDisputeSubmitting(true);
    try {
      await api.admin.resolveDispute(selectedDispute.id || selectedDispute.disputeId, {
        status: disputeResolutionStatus,
        adminNotes: disputeAdminNote,
      });
      toast.success(`আপত্তি ${selectedDispute.disputeId} সফলভাবে নিষ্পত্তি করা হয়েছে।`);
      setSelectedDispute(null);
      setDisputeAdminNote('');
      loadAllAdminData();
    } catch (e: any) {
      toast.error(e.message || 'আপত্তি নিষ্পত্তি করা সম্ভব হয়নি।');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleSaveReportEdit = async () => {
    if (!editModalReport) return;
    try {
      await api.admin.updateReportDetails(editModalReport.reportId, {
        productOrService: editProduct,
        incidentDescription: editDescription,
      });
      toast.success('পাবলিক বিবরণ সফলভাবে পরিমার্জন ও সংরক্ষণ হয়েছে।');
      setEditModalReport(null);
      loadAllAdminData();
    } catch (e: any) {
      toast.error(e.message || 'বিবরণ সম্পাদনা করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleToggleUserActive = async (targetUser: User) => {
    try {
      await api.admin.updateUserStatus(targetUser.id, {
        isActive: !targetUser.isActive,
      });
      toast.success(`ইউজার ${targetUser.name} এখন ${!targetUser.isActive ? 'সক্রিয়' : 'স্থগিত'}।`);
      loadAllAdminData();
    } catch (e: any) {
      toast.error(e.message || 'ইউজার স্ট্যাটাস পরিবর্তন করা যায়নি।');
    }
  };

  const handlePromoteRole = async (targetUser: User, newRole: string) => {
    try {
      await api.admin.updateUserStatus(targetUser.id, {
        role: newRole,
      });
      toast.success(`ইউজার ${targetUser.name} এর রোল পরিবর্তন করে ${newRole} করা হয়েছে।`);
      loadAllAdminData();
    } catch (e: any) {
      toast.error(e.message || 'রোল পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  if (!isModerator) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4 font-sans">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">অনুমতি সংরক্ষিত</h2>
        <p className="text-xs text-slate-500">
          এই বিভাগটি শুধুমাত্র অনুমোদিত ScamAlert BD মডারেটর এবং অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত।
        </p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          মূল পাতায় ফিরুন
        </button>
      </div>
    );
  }

  const pendingQueue = reports.filter((r) => r.status === 'pending_review');

  const getCategoryLabelBn = (cat: string) => {
    const found = CATEGORIES_BN.find((c) => c.id === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sliders className="w-4 h-4" />
            <span>মডারেশন ও অ্যাডমিনিস্ট্রেশন কমান্ড সেন্টার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            ScamAlert BD কেন্দ্রীয় নিয়ন্ত্রণ প্যানেল
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ডাটাবেজ: MongoDB Atlas (সক্রিয়)</span>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>লগইন: {user?.role.toUpperCase()} ({user?.name})</span>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block font-sans">মোট দাখিলকৃত রিপোর্ট</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-sans mt-0.5">
              {toBengaliNumber(stats.totalReports)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 shadow-[0_2px_10px_-2px_rgba(180,83,9,0.06)]">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block font-sans">
              অপেক্ষমাণ কিউ
            </span>
            <div className="text-xl font-black text-amber-900 dark:text-amber-200 font-sans mt-0.5">
              {toBengaliNumber(stats.pendingReports)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/90 dark:border-red-900/60 shadow-[0_2px_10px_-2px_rgba(220,38,38,0.06)]">
            <span className="text-[11px] font-bold text-red-800 dark:text-red-300 block font-sans">
              যাচাইকৃত প্রতারণা
            </span>
            <div className="text-xl font-black text-red-900 dark:text-red-200 font-sans mt-0.5">
              {toBengaliNumber(stats.verifiedIncidents)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/90 dark:border-sky-900/60 shadow-[0_2px_10px_-2px_rgba(2,132,199,0.06)]">
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block font-sans">
              ব্যবসায়িক আপত্তি
            </span>
            <div className="text-xl font-black text-sky-900 dark:text-sky-200 font-sans mt-0.5">
              {toBengaliNumber(stats.totalDisputes || disputes.length)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/90 dark:border-purple-900/60 shadow-[0_2px_10px_-2px_rgba(147,51,234,0.06)]">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 block font-sans">
              মোট ইউজার
            </span>
            <div className="text-xl font-black text-purple-900 dark:text-purple-200 font-sans mt-0.5">
              {toBengaliNumber(stats.totalUsers || 3)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 shadow-[0_2px_10px_-2px_rgba(225,29,72,0.06)]">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 block font-sans">মোট রিপোর্টকৃত ক্ষতি</span>
            <div className="text-lg font-black text-rose-700 dark:text-rose-200 font-sans mt-0.5">
              {formatBDT(stats.totalAmountLossBDT)}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'bg-amber-500 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>অপেক্ষমাণ কিউ ({toBengaliNumber(pendingQueue.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ব্যবসায়ীদের আপিল ও আপত্তি ({toBengaliNumber(disputes.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('all-reports')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 ${
            activeTab === 'all-reports'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>সকল রিপোর্ট ({toBengaliNumber(reports.length)})</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ব্যবহারকারী ব্যবস্থাপনা</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>অডিট ট্রেইল ও লগ ({toBengaliNumber(auditLogs.length)})</span>
          </button>
        )}
      </div>

      {/* TAB 1: PENDING QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4 animate-in fade-in">
          {pendingQueue.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                মডারেশন কিউ সম্পূর্ণ পরিষ্কার
              </h3>
              <p className="text-xs text-slate-500">
                সকল দাখিলকৃত অভিযোগ পরীক্ষা ও নিষ্পত্তি করা হয়েছে।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQueue.map((rep) => (
                <div
                  key={rep.id || rep.reportId}
                  className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4 text-xs font-sans"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                        {rep.reportId}
                      </span>
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        অপেক্ষমাণ
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {getCategoryLabelBn(rep.category)}
                      </span>
                    </div>

                    <span className="text-slate-400 text-[11px]">
                      দাখিলের সময়: {formatBengaliDate(rep.createdAt)} (দাখিলকারী: {rep.submittedBy.name})
                    </span>
                  </div>

                  {/* Incident Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">পণ্য বা সেবা</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rep.productOrService}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">ক্ষতির পরিমাণ</span>
                      <span className="font-bold text-red-600 font-sans">
                        {formatBDT(rep.transactionAmount)} টাকা
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">পেমেন্ট মেথড ও TrxID</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rep.paymentMethod} {rep.transactionReference ? `(${rep.transactionReference})` : ''}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 font-medium">অভিযোগের বিবরণ</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-sans">
                      {rep.incidentDescription}
                    </p>
                  </div>

                  {/* Private Evidence Preview for Moderators */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      সংযুক্ত প্রমাণপত্র ({toBengaliNumber(rep.evidenceFiles?.length || 0)}টি)
                    </span>
                    {rep.evidenceFiles && rep.evidenceFiles.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {rep.evidenceFiles.map((ev, i) => (
                          <a
                            key={ev.id || i}
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group block relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                          >
                            <img
                              src={ev.fileUrl}
                              alt={ev.originalFilename}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold">
                              প্রমাণ পরীক্ষা করুন
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">
                        কোনো প্রমাণপত্র আপলোড করা হয়নি।
                      </p>
                    )}
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setActionStatus('verified_incident');
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>যাচাইকৃত প্রতারণা হিসেবে অনুমোদন করুন</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setActionStatus('under_review');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>তদন্তাধীন চিহ্নিত করুন</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setActionStatus('rejected');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>রিপোর্ট বাতিল করুন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISPUTES & APPEALS */}
      {activeTab === 'disputes' && (
        <div className="space-y-4 animate-in fade-in text-xs font-sans">
          {disputes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)]">
              <p className="text-slate-500">বর্তমানে কোনো সক্রিয় ব্যবসায়িক আপত্তি নেই।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((disp) => (
                <div
                  key={disp.id || disp.disputeId}
                  className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-sky-300 dark:border-sky-900/60 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {disp.disputeId}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        রিপোর্ট: <strong className="text-red-600">{disp.reportId}</strong>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          disp.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : disp.status === 'resolved_removed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {disp.status === 'pending' ? 'অমীমাংসিত' : disp.status === 'resolved_removed' ? 'আপত্তি গৃহীত' : 'আপত্তি খারিজ'}
                      </span>
                    </div>

                    <span className="text-slate-400 text-[11px]">
                      দাখিলের তারিখ: {formatBengaliDate(disp.createdAt)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40">
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                      দাবিকারী: {disp.claimantName} ({disp.claimantRole})
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      ইমেইল: {disp.claimantEmail} | মোবাইল: {disp.claimantPhone}
                    </div>
                    <div className="mt-2 text-slate-700 dark:text-slate-300 font-medium">
                      <strong>আপত্তির কারণ:</strong> {disp.reason}
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 italic font-sans">
                      "{disp.details}"
                    </p>
                  </div>

                  {disp.supportingEvidence && disp.supportingEvidence.length > 0 && (
                    <div>
                      <span className="font-bold block mb-1">আপত্তির স্বপক্ষে প্রমাণপত্র:</span>
                      <div className="flex gap-2 flex-wrap">
                        {disp.supportingEvidence.map((ev, idx) => (
                          <a
                            key={idx}
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 text-[11px] font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{ev.originalFilename || `ডকুমেন্ট ${toBengaliNumber(idx + 1)}`}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => onViewReport(disp.reportId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      আসল রিপোর্ট পরীক্ষা
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDispute(disp);
                        setDisputeResolutionStatus('resolved_removed');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      আপত্তি গ্রহণ করে রিপোর্ট অপসারণ করুন
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDispute(disp);
                        setDisputeResolutionStatus('resolved_upheld');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      আপিল খারিজ করে রিপোর্ট বহাল রাখুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL REPORTS TABLE */}
      {activeTab === 'all-reports' && (
        <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4 animate-in fade-in text-xs font-sans">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              ডাটাবেজে সংরক্ষিত রিপোর্ট তালিকা ({toBengaliNumber(reports.length)}টি)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-red-100 dark:divide-slate-800">
              <thead className="bg-red-100/60 dark:bg-slate-800/50 text-red-900/80 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">রিপোর্ট আইডি</th>
                  <th className="p-3">মাধ্যম</th>
                  <th className="p-3">অভিযুক্ত নম্বর / পেজ</th>
                  <th className="p-3">ক্ষতি (টাকা)</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={7} />
                  ))
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.id || rep.reportId} className="hover:bg-red-100/40 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{rep.reportId}</td>
                      <td className="p-3 font-semibold text-[11px] text-slate-500">
                        {getCategoryLabelBn(rep.category)}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        {rep.identifiers.phone || rep.identifiers.bkashNumber || rep.identifiers.facebookPageName || 'Entity'}
                      </td>
                      <td className="p-3 font-bold font-sans tabular-nums text-red-600">
                        {formatBDT(rep.transactionAmount)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={rep.status} size="sm" />
                      </td>
                      <td className="p-3 text-slate-400 font-sans text-[11px]">
                        {formatBengaliDate(rep.createdAt)}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditModalReport(rep);
                            setEditProduct(rep.productOrService);
                            setEditDescription(rep.incidentDescription);
                          }}
                          className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 hover:bg-red-50 text-slate-700 dark:text-slate-300 font-bold transition text-[11px]"
                        >
                          সম্পাদনা
                        </button>
                        <button
                          onClick={() => onViewReport(rep.reportId)}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition text-[11px]"
                        >
                          তদন্ত
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT (ADMIN ONLY) */}
      {isAdmin && activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4 animate-in fade-in text-xs font-sans">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            নিবন্ধিত প্ল্যাটফর্ম ব্যবহারকারী ({toBengaliNumber(usersList.length)} জন)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-red-100 dark:divide-slate-800">
              <thead className="bg-red-100/60 dark:bg-slate-800/50 text-red-900/80 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">নাম</th>
                  <th className="p-3">ইমেইল</th>
                  <th className="p-3">ভূমিকা (রোল)</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3">যোগদানের তারিখ</th>
                  <th className="p-3 text-right">অ্যাডমিন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={6} />
                  ))
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-red-100/40 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="p-3 font-mono text-slate-500">{u.email}</td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                          {u.role === 'admin' ? 'অ্যাডমিন' : u.role === 'moderator' ? 'মডারেটর' : 'সাধারণ ইউজার'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[11px] font-bold flex items-center gap-1.5 ${
                            u.isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          ></span>
                          <span>{u.isActive ? 'সক্রিয়' : 'স্থগিত'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-sans text-[11px]">
                        {formatBengaliDate(u.createdAt)}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                            u.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {u.isActive ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handlePromoteRole(u, u.role === 'moderator' ? 'user' : 'moderator')}
                            className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 hover:bg-red-50 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition"
                          >
                            {u.role === 'moderator' ? 'ইউজার করুন' : 'মডারেটর করুন'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS (ADMIN ONLY) */}
      {isAdmin && activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(239,68,68,0.08)] space-y-4 animate-in fade-in text-xs font-sans">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              প্রশাসনিক অডিট ট্রেইল ও অ্যাকশন হিস্ট্রি
            </h3>
            <span className="text-slate-400 text-[11px]">
              প্রতিটি প্রশাসনিক সিদ্ধান্ত স্বয়ংক্রিয়ভাবে সংরক্ষিত
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {log.targetType}: {log.targetId}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans">{log.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {log.adminName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {formatBengaliDate(log.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderation Action Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs space-y-4 shadow-2xl"
            >
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                রিপোর্ট মডারেশন: {selectedReport.reportId}
              </h3>

              <div>
                <label className="block font-semibold mb-1">নতুন স্ট্যাটাস নির্ধারণ করুন</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                >
                  <option value="verified_incident">যাচাইকৃত প্রতারণা (প্রমাণিত কেস)</option>
                  <option value="under_review">তদন্তাধীন (প্রমাণ যাচাই চলছে)</option>
                  <option value="disputed">আপত্তি দাখিলকৃত (ব্যবসায়ীর আপিল চলমান)</option>
                  <option value="rejected">বাতিল / খারিজ (অপ্রতুল প্রমাণ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  মডারেটর নোট (পাবলিক বা রেকর্ডে সংরক্ষিত থাকবে)
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="যেমন: ৩ জন স্বতন্ত্র ক্রেতার অভিযোগ ও কুরিয়ার ট্র্যাকিং স্লিপ দ্বারা প্রমাণিত..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                ></textarea>
              </div>

              {actionStatus === 'rejected' && (
                <div>
                  <label className="block font-semibold mb-1 text-red-500">
                    বাতিল করার কারণ (রিপোর্টকারীকে দেখানো হবে)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="যেমন: কোনো পেমেন্ট রসিদ নেই বা ভুল বোঝাবুঝি নিষ্পত্তি হয়েছে"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={handleApplyModeration}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition disabled:opacity-50"
                >
                  {actionSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'স্ট্যাটাস প্রয়োগ করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispute Resolution Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs space-y-4 shadow-2xl"
            >
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                আপত্তি নিষ্পত্তি: {selectedDispute.disputeId}
              </h3>

              <div>
                <label className="block font-semibold mb-1">প্রশাসনিক সিদ্ধান্ত</label>
                <select
                  value={disputeResolutionStatus}
                  onChange={(e) => setDisputeResolutionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="resolved_removed">
                    আপত্তি গ্রহণ ও রিপোর্ট অপসারণ (বিক্রেতার সততা প্রমাণিত)
                  </option>
                  <option value="resolved_upheld">
                    আপিল খারিজ ও অভিযোগ বহাল (প্রতারণা প্রমাণিত)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">সালিশি নোট ও কারণ</label>
                <textarea
                  rows={3}
                  value={disputeAdminNote}
                  onChange={(e) => setDisputeAdminNote(e.target.value)}
                  placeholder="সিদ্ধান্তের কারণ লিখুন (যেমন: কুরিয়ার চালান যাচাই করে পণ্য প্রাপ্তি নিশ্চিত হওয়া গেছে)..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200/80 dark:border-slate-700 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 rounded-xl border border-red-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-800 transition font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={disputeSubmitting}
                  onClick={handleResolveDispute}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition disabled:opacity-50"
                >
                  {disputeSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত চূড়ান্ত করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redaction / Edit Modal */}
      <AnimatePresence>
        {editModalReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#fef2f2] dark:bg-slate-900 border border-red-200/90 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs space-y-4 shadow-2xl"
            >
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                বিবরণ সম্পাদনা ও পরিমার্জন: {editModalReport.reportId}
              </h3>

              <div>
                <label className="block font-semibold mb-1">পণ্য বা সেবার শিরোনাম</label>
                <input
                  type="text"
                  value={editProduct}
                  onChange={(e) => setEditProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ঘটনার বিবরণ (অসংবেদনশীল পরিমার্জন)</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveReportEdit}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
