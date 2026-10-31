import React from 'react';
import { ShieldAlert, PhoneCall, ExternalLink, ShieldCheck, Heart, AlertCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Important Legal / Trust Notice Banner */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 mb-12 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 leading-relaxed font-sans">
            <span className="font-bold text-slate-200">আইনি ও ভেরিফিকেশন নীতিমালা: </span>
            ডাটাবেজে কোনো রিপোর্ট না থাকার অর্থ এই নয় যে বিক্রেতা বা অ্যাকাউন্টটি শতভাগ নিরাপদ বা সরকারি ভেরিফাইড। ScamAlert BD সাধারণ ক্রেতাদের দেওয়া প্রমাণপত্র, ভুক্তভোগীদের অভিজ্ঞতা এবং লেনদেন রসিদ যাচাই করে সতর্কবার্তা প্রকাশ করে। কোনো বৈধ ব্যবসায়ী অসত্য বা উদ্দেশ্যপ্রণোদিত রিপোর্টের শিকার হলে আনুষ্ঠানিক আপিল ও অপসারণ আবেদনের পূর্ণ অধিকার রাখেন।
          </div>
          <button
            onClick={() => onNavigate('dispute')}
            className="shrink-0 text-xs text-amber-400 hover:text-amber-300 underline font-bold"
          >
            ব্যবসায়ী আপত্তি ও অপসারণ আবেদন
          </button>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                ScamAlert<span className="text-red-500">BD</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans">
              বাংলাদেশের নাগরিক পরিচালিত ই-কমার্স প্রতারণা প্রতিরোধ ও তথ্য ভাণ্ডার নেটওয়ার্ক। সামাজিক যোগাযোগ মাধ্যমে ভুয়া অনলাইন শপ, অগ্রিম কুরিয়ার চার্জ এবং মোবাইল ব্যাংকিং জালিয়াতি রোধে নিবেদিত।
            </p>
            <div className="font-semibold text-slate-300 font-sans">
              মূল স্লোগান: <span className="text-red-400 font-bold">থামুন। খুঁজুন। সুরক্ষিত থাকুন।</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              প্ল্যাটফর্ম
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <button
                  onClick={() => onNavigate('search')}
                  className="hover:text-white transition font-medium"
                >
                  মোবাইল / বিকাশ / ফেসবুক অনুসন্ধান
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('report-submit')}
                  className="hover:text-red-400 text-red-400 font-bold transition"
                >
                  প্রতারণার অভিযোগ দাখিল করুন
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('recent')}
                  className="hover:text-white transition font-medium"
                >
                  সাম্প্রতিক যাচাইকৃত ঘটনাসমূহ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition font-medium"
                >
                  কার্যপদ্ধতি ও মডারেশন নীতিমালা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dispute')}
                  className="hover:text-white transition font-medium"
                >
                  ব্যবসায়ী আপত্তি ও নাম অপসারণ আবেদন
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Safety Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              ভোক্তা নিরাপত্তা ও সচেতনতা
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <button
                  onClick={() => onNavigate('safety-guide')}
                  className="hover:text-white transition font-medium"
                >
                  বিকাশ ও নগদ পেমেন্ট জালিয়াতি থেকে বাঁচার উপায়
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety-guide')}
                  className="hover:text-white transition font-medium"
                >
                  কুরিয়ার অগ্রিম চার্জ প্রতারণার ফাঁদ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety-guide')}
                  className="hover:text-white transition font-medium"
                >
                  ক্লোন ও ভুয়া ফেসবুক পেজ চেনার উপায়
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety-guide')}
                  className="hover:text-white transition font-medium"
                >
                  নিকটস্থ থানায় অনলাইন জিডি করার নিয়ম
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Bangladesh Cyber Helplines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              জরুরি সাইবার পুলিশ হেল্পলাইন
            </h4>
            <div className="space-y-2.5 text-slate-400 font-sans">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">সিআইডি সাইবার পুলিশ সেন্টার (CID)</div>
                <div className="text-red-400 font-mono font-bold">01320010148 / 01769691522</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">জাতীয় জরুরি সেবা হটলাইন</div>
                <div className="text-red-400 font-mono font-bold text-sm">999</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">পুলিশ সাইবার সাপোর্ট ফর উইমেন</div>
                <div className="text-red-400 font-mono font-bold">01320000888</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-sans">
          <div>
            © {new Date().getFullYear()} ScamAlert BD — সচেতন বাংলাদেশি অনলাইন ক্রেতাদের সুরক্ষায় নিবেদিত।
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>কমিউনিটি নিয়ন্ত্রিত ও সুরক্ষিত প্ল্যাটফর্ম</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
