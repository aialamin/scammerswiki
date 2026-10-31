/**
 * Normalizes Bangladeshi phone numbers, MFS numbers (bKash, Nagad, Rocket),
 * and URLs for uniform search and fraud indexing.
 */

export interface NormalizedResult {
  raw: string;
  normalized: string; // e.g. 01712345678 or +8801712345678
  canonical: string;  // 01XXXXXXXXX (11 digits)
  isValidBD: boolean;
  operator?: string;
  type?: 'mobile' | 'facebook' | 'website' | 'other';
}

/**
 * Standardize Bangladeshi mobile number
 * Handles formats:
 * - 01712345678
 * - +8801712345678
 * - 8801712345678
 * - 01712-345678, +88 017 12 345678, etc.
 */
export function normalizeBDPhone(input: string): NormalizedResult {
  if (!input) {
    return { raw: '', normalized: '', canonical: '', isValidBD: false };
  }

  const raw = input.trim();
  // Strip all non-digit characters except leading '+'
  let cleaned = raw.replace(/[^\d+]/g, '');

  // Strip leading '+'
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 880, strip the 88
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(2); // now starts with 0
  }

  // Rocket numbers sometimes have a 12th check digit, e.g., 017123456781
  const is12DigitRocket = cleaned.length === 12 && /^01[3-9]\d{9}$/.test(cleaned);

  // Standard 11 digit Bangladeshi mobile: 013, 014, 015, 016, 017, 018, 019
  const is11Digit = cleaned.length === 11 && /^01[3-9]\d{8}$/.test(cleaned);

  const isValidBD = is11Digit || is12DigitRocket;

  let operator = 'Unknown';
  if (cleaned.startsWith('017') || cleaned.startsWith('013')) operator = 'Grameenphone';
  else if (cleaned.startsWith('018')) operator = 'Robi';
  else if (cleaned.startsWith('016')) operator = 'Airtel';
  else if (cleaned.startsWith('019') || cleaned.startsWith('014')) operator = 'Banglalink';
  else if (cleaned.startsWith('015')) operator = 'Teletalk';

  const canonical = is11Digit ? cleaned : (is12DigitRocket ? cleaned.substring(0, 11) : cleaned);

  return {
    raw,
    normalized: cleaned,
    canonical,
    isValidBD,
    operator,
    type: 'mobile',
  };
}

/**
 * Normalize Facebook Page URL or handle
 * e.g., "https://www.facebook.com/gadgetsbangladesh?mibextid=ZbWKwL" -> "gadgetsbangladesh"
 * "@gadgetsbangladesh" -> "gadgetsbangladesh"
 */
export function normalizeFacebook(input: string): string {
  if (!input) return '';
  let str = input.trim().toLowerCase();
  // Strip leading @
  if (str.startsWith('@')) str = str.substring(1);

  // Remove protocol and fb domains
  str = str.replace(/^https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.com)\//, '');
  // Remove query params
  str = str.split('?')[0].split('#')[0];
  // Remove trailing slashes
  str = str.replace(/\/+$/, '');
  // Remove "pages/..." or "groups/..." prefixes if any
  str = str.replace(/^(pages|groups|profile\.php\?id=)/, '');

  return str.trim();
}

/**
 * Normalize Website URL or domain
 * e.g., "https://shop-bd-fake.com/product/123" -> "shop-bd-fake.com"
 */
export function normalizeWebsite(input: string): string {
  if (!input) return '';
  let str = input.trim().toLowerCase();
  str = str.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return str.split('/')[0].split('?')[0].trim();
}

/**
 * Mask sensitive identifier for public view
 * e.g., 01712345678 -> 01712***678
 */
export function maskIdentifier(identifier: string, category?: string): string {
  if (!identifier) return '';
  const trimmed = identifier.trim();

  // If it's a mobile / payment number (11 digits)
  if (/^\d{11}$/.test(trimmed)) {
    return `${trimmed.substring(0, 5)}***${trimmed.substring(8)}`;
  }
  // If email
  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
  }
  // If 12 digit rocket
  if (/^\d{12}$/.test(trimmed)) {
    return `${trimmed.substring(0, 5)}****${trimmed.substring(9)}`;
  }

  return trimmed;
}
