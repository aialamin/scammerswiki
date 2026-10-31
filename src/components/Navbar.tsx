import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  PlusCircle,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  User as UserIcon,
  UserCheck,
  LogOut,
  Sliders,
  ChevronDown,
  Layers,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { api } from '../services/api.ts';
import { NotificationItem } from '../types/index.ts';
import { toBengaliNumber } from '../utils/bengali.ts';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { user, logout, demoLogin, isModerator, isAdmin, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Background silent
    }
  };

  const handleMarkNotifRead = async (id: string, link?: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link && link.startsWith('/report/')) {
        const reportId = link.replace('/report/', '');
        onNavigate('report-detail', { reportId });
        setNotifDropdownOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const roleTitleBn =
    user?.role === 'admin'
      ? 'প্রধান অ্যাডমিন'
      : user?.role === 'moderator'
      ? 'তদন্ত মডারেটর'
      : 'ব্যবহারকারী';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#080c14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Precision Top Utility Strip for Live Evaluator Switching */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">বাংলাদেশ অনলাইন প্রতারণা প্রতিরোধ সেল</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 hidden sm:inline">সিআইডি সাইবার পুলিশ ও এমএফএস মনিটরিং ডাটাবেজ</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-slate-500 hidden md:inline">টেস্ট রোল:</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => demoLogin('admin')}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                user?.role === 'admin'
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ShieldAlert className="w-3 h-3 stroke-[2.2]" />
              <span>অ্যাডমিন</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => demoLogin('moderator')}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                user?.role === 'moderator'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
              <span>মডারেটর</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => demoLogin('user')}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                user?.role === 'user'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <UserCheck className="w-3 h-3 stroke-[2.2]" />
              <span>ইউজার</span>
            </motion.button>
            {isAuthenticated && (
              <button
                onClick={logout}
                className="text-slate-400 hover:text-white ml-2 text-[11px] font-medium transition"
              >
                সাইন আউট
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                ScamAlert<span className="text-red-600 dark:text-red-500">BD</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-0.5">
                সতর্ক নাগরিক নেটওয়ার্ক
              </span>
            </div>
          </div>

          {/* Zone 2: Bengali text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onNavigate('search')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                currentPage === 'search'
                  ? 'text-red-600 dark:text-red-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              অনুসন্ধান
            </button>
            <button
              onClick={() => onNavigate('recent')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                currentPage === 'recent'
                  ? 'text-red-600 dark:text-red-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              সাম্প্রতিক রিপোর্ট
            </button>
            <button
              onClick={() => onNavigate('risk-calculator')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                currentPage === 'risk-calculator'
                  ? 'text-red-600 dark:text-red-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ঝুঁকি ক্যালকুলেটর
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                currentPage === 'how-it-works'
                  ? 'text-red-600 dark:text-red-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              কার্যপদ্ধতি
            </button>
            <button
              onClick={() => onNavigate('safety-guide')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                currentPage === 'safety-guide'
                  ? 'text-red-600 dark:text-red-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              নিরাপত্তা গাইড
            </button>

            {isModerator && (
              <button
                onClick={() => onNavigate('admin')}
                className={`whitespace-nowrap shrink-0 text-amber-600 dark:text-amber-400 font-bold hover:text-amber-700 transition flex items-center gap-1.5 ${
                  currentPage === 'admin' ? 'underline underline-offset-4' : ''
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>মডারেশন প্যানেল</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action + profile / utilities */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate('report-submit')}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              প্রতারণার অভিযোগ দাখিল
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition"
              aria-label="থিম পরিবর্তন করুন"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg relative transition"
                  aria-label="নোটিফিকেশন"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900"></span>
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.16)] dark:shadow-[0_18px_40px_-6px_rgba(0,0,0,0.8)] border border-slate-200/90 dark:border-slate-800 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 font-sans">
                          বিজ্ঞপ্তিসমূহ ({toBengaliNumber(notifications.length)})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              await api.notifications.markAllRead();
                              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                              setUnreadCount(0);
                            }}
                            className="text-[11px] text-red-600 dark:text-red-400 font-bold hover:underline"
                          >
                            সবগুলো পঠিত চিহ্নিত করুন
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 font-sans">
                            এখনও কোনো বিজ্ঞপ্তি নেই।
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkNotifRead(n.id, n.link)}
                              className="p-3.5 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                            >
                              <span className="font-bold text-slate-900 dark:text-slate-100 block font-sans">
                                {n.title}
                              </span>
                              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed font-sans">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.16)] dark:shadow-[0_18px_40px_-6px_rgba(0,0,0,0.8)] border border-slate-200/90 dark:border-slate-800 py-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-sans">
                          {user?.name}
                        </p>
                        <span className="text-[10px] text-red-600 dark:text-red-400 font-bold font-sans">
                          {roleTitleBn}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>আমার ড্যাশবোর্ড</span>
                      </button>

                      {isModerator && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold flex items-center gap-2 transition"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-500" />
                          <span>অ্যাডমিন ও মডারেশন</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium transition"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>লগআউট</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  লগইন
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 dark:text-slate-300"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080c14] px-4 py-4 space-y-2">
          <button
            onClick={() => {
              onNavigate('search');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            অনুসন্ধান ডাটাবেজ
          </button>
          <button
            onClick={() => {
              onNavigate('recent');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            সাম্প্রতিক রিপোর্ট
          </button>
          <button
            onClick={() => {
              onNavigate('risk-calculator');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            প্রতারণা ঝুঁকি ক্যালকুলেটর
          </button>
          <button
            onClick={() => {
              onNavigate('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            কার্যপদ্ধতি
          </button>
          <button
            onClick={() => {
              onNavigate('safety-guide');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            ভোক্তা নিরাপত্তা গাইড
          </button>
          {isModerator && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-lg"
            >
              মডারেশন কনসোল
            </button>
          )}
          <div className="pt-2">
            <button
              onClick={() => {
                onNavigate('report-submit');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm"
            >
              প্রতারণার অভিযোগ দাখিল করুন
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
