export const BENGALI_DIGITS: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

/**
 * Converts English digits to Bengali digits.
 */
export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '০';
  const str = typeof val === 'number' ? val.toLocaleString('en-US') : String(val);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[digit] || digit);
}

/**
 * Formats a currency amount into Bengali Taka (৳).
 */
export function formatBDT(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '৳ ০';
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `৳ ${toBengaliNumber(num.toLocaleString('en-US'))}`;
}

/**
 * Formats a date into natural Bengali format (e.g. "১২ অক্টোবর, ২০২৬").
 */
export function formatBengaliDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'অজানা তারিখ';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'অজানা তারিখ';

    const monthsBn = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];

    const day = toBengaliNumber(d.getDate());
    const month = monthsBn[d.getMonth()];
    const year = toBengaliNumber(d.getFullYear());

    return `${day} ${month}, ${year}`;
  } catch {
    return 'অজানা তারিখ';
  }
}

export const CATEGORIES_BN = [
  { id: 'all', label: 'সবগুলো', desc: 'সকল মাধ্যম' },
  { id: 'bkash', label: 'বিকাশ নম্বর', desc: 'ভুয়া ডেলিভারি চার্জ বা সেন্ড মানি' },
  { id: 'nagad', label: 'নগদ নম্বর', desc: 'সেন্ড মানি বা পার্সোনাল ওয়ালেট' },
  { id: 'facebook', label: 'ফেসবুক পেজ', desc: 'অনলাইন শপ বা ক্লোন পেজ' },
  { id: 'phone', label: 'মোবাইল নম্বর', desc: 'সন্দেহভাজন বিক্রেতা বা কলার' },
  { id: 'whatsapp', label: 'হোয়াটসঅ্যাপ', desc: 'চ্যাট বা টেলিগ্রাম কাজের ফাঁদ' },
  { id: 'rocket', label: 'রকেট (DBBL)', desc: 'ডাচ-বাংলা মোবাইল ব্যাংকিং' },
  { id: 'website', label: 'ওয়েবসাইট', desc: 'ভুয়া ই-কমার্স বা ফিশিং লিঙ্ক' },
  { id: 'other', label: 'অন্যান্য মাধ্যম', desc: 'অন্য যেকোনো প্রতারণা' },
];

export const STATUS_MAP_BN: Record<string, { label: string; desc: string; color: string }> = {
  verified_incident: {
    label: 'যাচাইকৃত প্রতারণা',
    desc: 'একাধিক অভিযোগ ও প্রমাণের ভিত্তিতে প্রমাণিত ঘটনা',
    color: 'red',
  },
  under_review: {
    label: 'তদন্তাধীন / পর্যালোচনায়',
    desc: 'অভিযোগ পাওয়া গেছে, টিম প্রমাণ যাচাই করছে',
    color: 'amber',
  },
  disputed: {
    label: 'বিক্রেতার আপত্তি দাখিল',
    desc: 'বিক্রেতা পাল্টা প্রমাণ দিয়ে আবেদন করেছেন',
    color: 'sky',
  },
  pending_review: {
    label: 'অপেক্ষমাণ',
    desc: 'প্রাথমিক মডারেশন কিউতে রয়েছে',
    color: 'slate',
  },
  rejected: {
    label: 'বাতিলকৃত',
    desc: 'পর্যাপ্ত প্রমাণ না থাকায় খারিজ করা হয়েছে',
    color: 'slate',
  },
  no_reports: {
    label: 'কোনো অভিযোগ নেই',
    desc: 'এখনও পর্যন্ত কোনো অভিযোগ পাওয়া যায়নি',
    color: 'emerald',
  },
};

export const PAYMENT_METHODS_BN = [
  { id: 'bKash Send Money', label: 'বিকাশ সেন্ড মানি (ব্যক্তিগত নম্বর)' },
  { id: 'bKash Merchant Payment', label: 'বিকাশ মার্চেন্ট পেমেন্ট (কিউআর/কাউন্টার)' },
  { id: 'Nagad Send Money', label: 'নগদ সেন্ড মানি (ব্যক্তিগত নম্বর)' },
  { id: 'Rocket Send Money', label: 'রকেট সেন্ড মানি (DBBL)' },
  { id: 'Bank Transfer (EFT/NPSB)', label: 'ব্যাংক ট্রান্সফার (EFT / NPSB)' },
  { id: 'Upay / Cellfin', label: 'উপায় / সেলফিন (Upay / Cellfin)' },
  { id: 'Cash Advance at Courier Hub', label: 'কুরিয়ার অফিসে অগ্রিম প্রদান' },
];
