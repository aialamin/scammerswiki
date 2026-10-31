import { Request, Response } from 'express';
import { inAppDB } from '../services/mockDatabase.ts';
import { normalizeBDPhone, maskIdentifier } from '../services/normalizer.ts';

export async function search(req: Request, res: Response) {
  try {
    const q = ((req.query.q as string) || '').trim();
    const category = ((req.query.category as string) || 'all').toLowerCase();
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt((req.query.limit as string) || '10', 10)));

    if (!q) {
      return res.json({
        success: true,
        query: '',
        category,
        total: 0,
        page,
        totalPages: 0,
        results: [],
        disclaimer:
          'A missing report does not mean an account is 100% verified or safe. Exercise caution with any seller demanding non-refundable advance payments.',
      });
    }

    const matchedReports = inAppDB.searchReports(q, category);

    // Grouping by primary matching identifier so duplicate complaints against the same phone/page are summarized cleanly
    const formattedResults = matchedReports.map((rep) => {
      // Find matching primary identifier to highlight
      let primaryIdentifier =
        rep.identifiers.phone ||
        rep.identifiers.bkashNumber ||
        rep.identifiers.nagadNumber ||
        rep.identifiers.facebookPageName ||
        rep.identifiers.websiteUrl ||
        rep.identifiers.rocketNumber ||
        'Unspecified';

      return {
        id: rep.id,
        reportId: rep.reportId,
        category: rep.category,
        productOrService: rep.productOrService,
        primaryIdentifier: maskIdentifier(primaryIdentifier),
        rawIdentifier: primaryIdentifier, // Used when user is authorized to view
        identifiers: {
          phone: rep.identifiers.phone ? maskIdentifier(rep.identifiers.phone) : undefined,
          whatsapp: rep.identifiers.whatsapp ? maskIdentifier(rep.identifiers.whatsapp) : undefined,
          facebookPageName: rep.identifiers.facebookPageName,
          facebookUrl: rep.identifiers.facebookUrl,
          websiteUrl: rep.identifiers.websiteUrl,
          bkashNumber: rep.identifiers.bkashNumber ? maskIdentifier(rep.identifiers.bkashNumber) : undefined,
          nagadNumber: rep.identifiers.nagadNumber ? maskIdentifier(rep.identifiers.nagadNumber) : undefined,
          rocketNumber: rep.identifiers.rocketNumber ? maskIdentifier(rep.identifiers.rocketNumber) : undefined,
        },
        status: rep.status,
        corroboratingReportsCount: rep.corroboratingCount,
        disputeCount: rep.disputeCount,
        evidenceCount: rep.evidenceFiles.length,
        hasEvidence: rep.evidenceFiles.length > 0,
        transactionAmountBDT: rep.transactionAmount,
        lastReportDate: rep.updatedAt || rep.createdAt,
        incidentSummary: rep.incidentDescription.slice(0, 160) + (rep.incidentDescription.length > 160 ? '...' : ''),
      };
    });

    const startIndex = (page - 1) * limit;
    const paginatedResults = formattedResults.slice(startIndex, startIndex + limit);

    const normPhone = normalizeBDPhone(q);

    return res.json({
      success: true,
      query: q,
      normalizedQuery: normPhone.isValidBD ? normPhone.canonical : q,
      category,
      total: formattedResults.length,
      page,
      totalPages: Math.ceil(formattedResults.length / limit) || 1,
      results: paginatedResults,
      disclaimer:
        'IMPORTANT: ScamAlert BD aggregates community allegations and verified police/MFS reports. A missing report does not mean an account or merchant is safe. Unverified allegations are never displayed as confirmed scams.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Search query failed: ' + err.message });
  }
}

export async function getSuggestions(req: Request, res: Response) {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions: Array<{ label: string; category: string; type: string }> = [];

    // Check existing reports
    for (const rep of inAppDB.reports) {
      if (rep.identifiers.phone && rep.identifiers.phone.includes(q)) {
        suggestions.push({ label: rep.identifiers.phone, category: 'phone', type: 'Phone / MFS' });
      }
      if (rep.identifiers.bkashNumber && rep.identifiers.bkashNumber.includes(q)) {
        suggestions.push({ label: rep.identifiers.bkashNumber, category: 'bkash', type: 'bKash Number' });
      }
      if (rep.identifiers.facebookPageName && rep.identifiers.facebookPageName.toLowerCase().includes(q)) {
        suggestions.push({ label: rep.identifiers.facebookPageName, category: 'facebook', type: 'Facebook Page' });
      }
      if (rep.identifiers.websiteUrl && rep.identifiers.websiteUrl.toLowerCase().includes(q)) {
        suggestions.push({ label: rep.identifiers.websiteUrl, category: 'website', type: 'Website Domain' });
      }
      if (rep.reportId.toLowerCase().includes(q)) {
        suggestions.push({ label: rep.reportId, category: 'report', type: 'Report ID' });
      }
    }

    // Deduplicate suggestions by label
    const unique = Array.from(new Map(suggestions.map((item) => [item.label, item])).values()).slice(0, 6);

    return res.json({ success: true, suggestions: unique });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSearchHistory(_req: Request, res: Response) {
  return res.json({
    success: true,
    history: inAppDB.searchHistory.slice(0, 10),
    popularCategories: [
      { name: 'bKash Numbers', key: 'bkash', icon: 'wallet' },
      { name: 'Facebook Pages', key: 'facebook', icon: 'facebook' },
      { name: 'Nagad Accounts', key: 'nagad', icon: 'smartphone' },
      { name: 'Courier Advance Numbers', key: 'phone', icon: 'phone' },
      { name: 'Fake Websites', key: 'website', icon: 'globe' },
    ],
  });
}
