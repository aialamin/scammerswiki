import React, { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { ReportSubmissionPage } from './pages/ReportSubmissionPage.tsx';
import { UserDashboardPage } from './pages/UserDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { SafetyGuidePage } from './pages/SafetyGuidePage.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { ReportDetailModal } from './components/ReportDetailModal.tsx';
import { DisputeModal } from './components/DisputeModal.tsx';
import { AuthModal } from './components/AuthModals.tsx';
import { ScamRiskCalculator } from './components/ScamRiskCalculator.tsx';
import { api } from './services/api.ts';
import { Report } from './types/index.ts';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [searchParams, setSearchParams] = useState<{ query: string; category: string }>({
    query: '',
    category: 'all',
  });

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [disputeReport, setDisputeReport] = useState<Report | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  // Scroll to top on navigation
  const navigateTo = (page: string, params?: any) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'report-detail' && params?.reportId) {
      handleOpenReportDetail(params.reportId);
    }
  };

  const handleSearch = (query: string, category: string = 'all') => {
    setSearchParams({ query, category });
    navigateTo('search');
  };

  const handleOpenReportDetail = async (reportId: string) => {
    try {
      const res = await api.reports.getById(reportId);
      if (res.success && res.report) {
        setActiveReport(res.report);
        setReportModalOpen(true);
      } else {
        toast.error(`রিপোর্ট ${reportId} খুঁজে পাওয়া যায়নি।`);
      }
    } catch (err: any) {
      toast.error('রিপোর্টের তথ্য লোড করা যায়নি: ' + (err.message || ''));
    }
  };

  const handleOpenDispute = (report: Report) => {
    setDisputeReport(report);
    setDisputeModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#090d16] text-[#0f172a] dark:text-[#f1f5f9] transition-colors">
      <Toaster position="top-right" richColors closeButton theme="system" />

      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onOpenRegister={() => {
          setAuthModalMode('register');
          setAuthModalOpen(true);
        }}
      />

      {/* Main Content Area with Page Motion */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentPage === 'home' && (
              <HomePage
                onSearch={handleSearch}
                onNavigate={navigateTo}
                onViewReport={handleOpenReportDetail}
              />
            )}

            {currentPage === 'search' && (
              <SearchPage
                initialQuery={searchParams.query}
                initialCategory={searchParams.category}
                onViewReport={handleOpenReportDetail}
                onOpenReportSubmit={() => navigateTo('report-submit')}
              />
            )}

            {currentPage === 'report-submit' && (
              <ReportSubmissionPage
                onReportCreated={(reportId) => handleOpenReportDetail(reportId)}
                onNavigateHome={() => navigateTo('home')}
              />
            )}

            {currentPage === 'recent' && (
              <div className="py-10">
                <SearchPage
                  initialQuery="01"
                  initialCategory="all"
                  onViewReport={handleOpenReportDetail}
                  onOpenReportSubmit={() => navigateTo('report-submit')}
                />
              </div>
            )}

            {currentPage === 'risk-calculator' && (
              <div className="py-8">
                <ScamRiskCalculator
                  onSearchScenario={(term) => handleSearch(term, 'all')}
                />
              </div>
            )}

            {currentPage === 'how-it-works' && (
              <div className="py-10">
                <HowItWorks
                  onStartSearch={() => navigateTo('search')}
                  onReportClick={() => navigateTo('report-submit')}
                />
              </div>
            )}

            {currentPage === 'safety-guide' && (
              <SafetyGuidePage
                onSearchClick={() => navigateTo('search')}
                onReportClick={() => navigateTo('report-submit')}
              />
            )}

            {currentPage === 'dashboard' && (
              <UserDashboardPage
                onViewReport={handleOpenReportDetail}
                onOpenReportSubmit={() => navigateTo('report-submit')}
                onNavigateHome={() => navigateTo('home')}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboardPage
                onViewReport={handleOpenReportDetail}
                onNavigateHome={() => navigateTo('home')}
              />
            )}

            {currentPage === 'dispute' && (
              <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 font-sans">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ব্যবসায়ী বা বিক্রেতার আপত্তি ও অপসারণ আবেদন
                  </h1>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    আপনার ব্যবসা প্রতিষ্ঠান, ব্র্যান্ড বা মোবাইল নম্বরের বিরুদ্ধে ভুল বা অসত্য অভিযোগ দাখিল হয়ে থাকলে, আপনার নম্বর বা পেজের নাম সার্চ করে আপত্তি দাখিল করুন।
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    নির্দিষ্ট কেস রেকর্ডের সাথে আপনার ডেলিভারি চালান বা রিফান্ড প্রমাণপত্র সংযুক্ত করতে প্রথমে আমাদের সার্চে গিয়ে আপনার নম্বর বা পেজ খুঁজুন এবং এরপর "আপত্তি দাখিল করুন" বোতামে চাপুন।
                  </p>
                  <button
                    onClick={() => navigateTo('search')}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
                  >
                    আপত্তি জানাতে নিজের প্রতিষ্ঠান খুঁজুন
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Modals */}
      <ReportDetailModal
        report={activeReport}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onOpenDispute={(r) => {
          setReportModalOpen(false);
          handleOpenDispute(r);
        }}
      />

      <DisputeModal
        report={disputeReport}
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        onDisputeSubmitted={(reportId) => {
          handleOpenReportDetail(reportId);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
