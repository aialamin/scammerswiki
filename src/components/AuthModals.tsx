import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { X, ShieldAlert, ShieldCheck, Mail, Lock, User, UserCheck, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, demoLogin } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
        toast.success('সফলভাবে সাইন ইন করেছেন।');
      } else {
        await register({ name, email, password, phone });
        toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'অপারেশন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      toast.error(err.message || 'অথেন্টিকেশন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'moderator' | 'user') => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      const roleLabel = role === 'admin' ? 'অ্যাডমিন' : role === 'moderator' ? 'মডারেটর' : 'সাধারণ ইউজার';
      toast.success(`${roleLabel} হিসেবে সাইন ইন সম্পন্ন হয়েছে।`);
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'ScamAlert BD-তে সাইন ইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login'
              ? 'আপনার দাখিলকৃত রিপোর্ট, ট্র্যাকিং আপডেট এবং ড্যাশবোর্ড সুবিধা পেতে প্রবেশ করুন।'
              : 'বাংলাদেশের অনলাইন কেনাকাটা সুরক্ষা ও সচেতন নাগরিক কমিউনিটিতে যুক্ত হোন।'}
          </p>
        </div>

        {/* 1-Click Demo Accounts Bar */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              এক ক্লিকে টেস্ট লগইন (পাসওয়ার্ড ছাড়া)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
              <span>অ্যাডমিন</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickDemo('moderator')}
              className="py-2 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
              <span>মডারেটর</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickDemo('user')}
              className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
              <span>ইউজার</span>
            </motion.button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                আপনার পূর্ণ নাম
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ইমেইল ঠিকানা
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭১XXXXXXX"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-red-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>প্রক্রিয়াধীন...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'সাইন ইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <span>
              কোনো অ্যাকাউন্ট নেই?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-red-600 dark:text-red-400 font-bold hover:underline"
              >
                বিনামূল্যে রেজিস্টার করুন
              </button>
            </span>
          ) : (
            <span>
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-red-600 dark:text-red-400 font-bold hover:underline"
              >
                এখানে সাইন ইন করুন
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
