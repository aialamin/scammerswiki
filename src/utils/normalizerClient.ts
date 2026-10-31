export interface NormalizedResult {
  raw: string;
  normalized: string;
  canonical: string;
  isValidBD: boolean;
  operator?: string;
  type?: 'mobile' | 'facebook' | 'website' | 'other';
}

export function normalizeBDPhone(input: string): NormalizedResult {
  if (!input) {
    return { raw: '', normalized: '', canonical: '', isValidBD: false };
  }

  const raw = input.trim();
  let cleaned = raw.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(2);
  }

  const is12DigitRocket = cleaned.length === 12 && /^01[3-9]\d{9}$/.test(cleaned);
  const is11Digit = cleaned.length === 11 && /^01[3-9]\d{8}$/.test(cleaned);
  const isValidBD = is11Digit || is12DigitRocket;

  let operator: string | undefined = undefined;
  if (cleaned.startsWith('017') || cleaned.startsWith('013')) operator = 'Grameenphone';
  else if (cleaned.startsWith('018')) operator = 'Robi';
  else if (cleaned.startsWith('016')) operator = 'Airtel';
  else if (cleaned.startsWith('019') || cleaned.startsWith('014')) operator = 'Banglalink';
  else if (cleaned.startsWith('015')) operator = 'Teletalk';

  const canonical = is11Digit ? cleaned : is12DigitRocket ? cleaned.substring(0, 11) : cleaned;

  return {
    raw,
    normalized: cleaned,
    canonical,
    isValidBD,
    operator,
    type: 'mobile',
  };
}

export function normalizeFacebook(input: string): string {
  if (!input) return '';
  let str = input.trim().toLowerCase();
  if (str.startsWith('@')) str = str.substring(1);
  str = str.replace(/^https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.com)\//, '');
  str = str.split('?')[0].split('#')[0];
  str = str.replace(/\/+$/, '');
  str = str.replace(/^(pages|groups|profile\.php\?id=)/, '');
  return str.trim();
}

export function normalizeWebsite(input: string): string {
  if (!input) return '';
  let str = input.trim().toLowerCase();
  str = str.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return str.split('/')[0].split('?')[0].trim();
}

export function maskIdentifier(identifier: string): string {
  if (!identifier) return '';
  const trimmed = identifier.trim();
  if (/^\d{11}$/.test(trimmed)) {
    return `${trimmed.substring(0, 5)}***${trimmed.substring(8)}`;
  }
  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
  }
  if (/^\d{12}$/.test(trimmed)) {
    return `${trimmed.substring(0, 5)}****${trimmed.substring(9)}`;
  }
  return trimmed;
}
