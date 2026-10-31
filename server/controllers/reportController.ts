import { Request, Response } from 'express';
import { inAppDB, DBReport, DBDispute } from '../services/mockDatabase.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { normalizeBDPhone, normalizeFacebook, normalizeWebsite, maskIdentifier } from '../services/normalizer.ts';

export async function createReport(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      category,
      phone,
      whatsapp,
      facebookPageName,
      facebookUrl,
      websiteUrl,
      bkashNumber,
      nagadNumber,
      rocketNumber,
      productOrService,
      transactionAmount,
      transactionDate,
      paymentMethod,
      transactionReference,
      incidentDescription,
      isAnonymous,
      reporterName,
      reporterEmail,
      evidenceUrls, // string[] or uploaded files
    } = req.body;

    if (!category || !incidentDescription || !productOrService) {
      return res.status(400).json({
        success: false,
        message: 'Category, product/service name, and incident description are required.',
      });
    }

    // Check that at least one seller identifier is provided
    const hasIdentifier =
      phone ||
      whatsapp ||
      facebookPageName ||
      facebookUrl ||
      websiteUrl ||
      bkashNumber ||
      nagadNumber ||
      rocketNumber;

    if (!hasIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one seller identifier (Phone, WhatsApp, Facebook, Website, or MFS number).',
      });
    }

    // Generate unique report ID: SBD-2026-XXXXX
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const reportId = `SBD-2026-${randomCode}`;

    // Generate search tokens for fast matching
    const tokens = new Set<string>();
    if (phone) {
      const norm = normalizeBDPhone(phone);
      if (norm.canonical) tokens.add(norm.canonical);
      if (norm.normalized) tokens.add(norm.normalized);
    }
    if (whatsapp) {
      const norm = normalizeBDPhone(whatsapp);
      if (norm.canonical) tokens.add(norm.canonical);
    }
    if (bkashNumber) {
      const norm = normalizeBDPhone(bkashNumber);
      if (norm.canonical) tokens.add(norm.canonical);
    }
    if (nagadNumber) {
      const norm = normalizeBDPhone(nagadNumber);
      if (norm.canonical) tokens.add(norm.canonical);
    }
    if (rocketNumber) {
      const norm = normalizeBDPhone(rocketNumber);
      if (norm.canonical) tokens.add(norm.canonical);
    }
    if (facebookPageName) {
      tokens.add(normalizeFacebook(facebookPageName));
    }
    if (facebookUrl) {
      tokens.add(normalizeFacebook(facebookUrl));
    }
    if (websiteUrl) {
      tokens.add(normalizeWebsite(websiteUrl));
    }

    // Handle evidence files: from multer files or body evidenceUrls
    const evidenceFiles: any[] = [];

    // Multer files if present
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File, index: number) => {
        evidenceFiles.push({
          id: `ev_${Date.now()}_${index}`,
          originalFilename: file.originalname,
          storageKey: `uploads/${file.filename}`,
          mimeType: file.mimetype,
          fileSize: file.size,
          fileUrl: `/uploads/${file.filename}`,
          uploadedAt: new Date().toISOString(),
        });
      });
    }

    // Additional evidence URLs passed in JSON (e.g., screenshots or uploaded links)
    if (Array.isArray(evidenceUrls)) {
      evidenceUrls.forEach((url: string, index: number) => {
        if (url) {
          evidenceFiles.push({
            id: `ev_url_${Date.now()}_${index}`,
            originalFilename: `Evidence_Screenshot_${index + 1}.png`,
            storageKey: `external/${index}`,
            mimeType: 'image/png',
            fileSize: 250000,
            fileUrl: url,
            uploadedAt: new Date().toISOString(),
          });
        }
      });
    }

    // Determine submitter info
    const userId = req.user ? req.user.id : undefined;
    const name = req.user ? req.user.name : reporterName || 'Anonymous Submitter';
    const email = req.user ? req.user.email : reporterEmail || 'anonymous@scamalertbd.com';

    const newReport: DBReport = {
      id: `rep_${Date.now()}`,
      reportId,
      submittedBy: {
        userId,
        name,
        email,
        isAnonymous: Boolean(isAnonymous),
      },
      category,
      identifiers: {
        phone: phone || '',
        whatsapp: whatsapp || '',
        facebookPageName: facebookPageName || '',
        facebookUrl: facebookUrl || '',
        websiteUrl: websiteUrl || '',
        bkashNumber: bkashNumber || '',
        nagadNumber: nagadNumber || '',
        rocketNumber: rocketNumber || '',
        normalizedSearchTokens: Array.from(tokens).filter(Boolean),
      },
      productOrService: productOrService.trim(),
      transactionAmount: Number(transactionAmount) || 0,
      transactionDate: transactionDate || new Date().toISOString(),
      paymentMethod: paymentMethod || 'bKash Send Money',
      transactionReference: transactionReference || '',
      incidentDescription: incidentDescription.trim(),
      evidenceFiles,
      status: 'pending_review',
      corroboratingCount: 1,
      disputeCount: 0,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inAppDB.reports.unshift(newReport);
    inAppDB.persistReport(newReport);

    // Create user notification
    if (userId) {
      const userNotif = {
        id: `notif_${Date.now()}`,
        userId,
        title: `Report Submitted: ${reportId}`,
        message:
          'Your report is now under initial review by our moderation team. You will be notified once verified.',
        type: 'report_status' as const,
        isRead: false,
        link: `/report/${reportId}`,
        createdAt: new Date().toISOString(),
      };
      inAppDB.notifications.unshift(userNotif);
      inAppDB.persistNotification(userNotif);
    }

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully and placed in Pending Review.',
      reportId: newReport.reportId,
      report: newReport,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create report: ' + err.message });
  }
}

export async function getReports(req: Request, res: Response) {
  try {
    const status = req.query.status as string;
    const category = req.query.category as string;
    const limit = Math.max(1, Math.min(50, parseInt((req.query.limit as string) || '20', 10)));

    let filtered = inAppDB.reports;

    // By default public list shows verified_incident, under_review, and disputed
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    } else {
      filtered = filtered.filter((r) => r.status !== 'rejected');
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.category === category);
    }

    // Map to public-safe view
    const safeReports = filtered.slice(0, limit).map((rep) => ({
      id: rep.id,
      reportId: rep.reportId,
      category: rep.category,
      productOrService: rep.productOrService,
      primaryIdentifier: maskIdentifier(
        rep.identifiers.phone ||
          rep.identifiers.bkashNumber ||
          rep.identifiers.facebookPageName ||
          rep.identifiers.websiteUrl ||
          'Unspecified'
      ),
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
      transactionAmount: rep.transactionAmount,
      transactionDate: rep.transactionDate,
      paymentMethod: rep.paymentMethod,
      status: rep.status,
      corroboratingCount: rep.corroboratingCount,
      disputeCount: rep.disputeCount,
      evidenceCount: rep.evidenceFiles.length,
      createdAt: rep.createdAt,
    }));

    return res.json({
      success: true,
      total: safeReports.length,
      reports: safeReports,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getReportById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = inAppDB.reports.find(
      (r) => r.reportId.toLowerCase() === id.toLowerCase() || r.id === id
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found with ID ' + id });
    }

    const isModeratorOrAdmin =
      req.user && (req.user.role === 'admin' || req.user.role === 'moderator');
    const isOwner = req.user && req.user.id === report.submittedBy.userId;

    // Public view redacts submitter email and raw payment numbers slightly
    const formatted = {
      ...report,
      submittedBy:
        isModeratorOrAdmin || isOwner
          ? report.submittedBy
          : {
              name: report.submittedBy.isAnonymous
                ? 'Anonymous Contributor'
                : report.submittedBy.name,
              isAnonymous: report.submittedBy.isAnonymous,
            },
      // Raw identifiers visible for search validation
      identifiers: isModeratorOrAdmin
        ? report.identifiers
        : {
            ...report.identifiers,
            phone: report.identifiers.phone ? maskIdentifier(report.identifiers.phone) : '',
            whatsapp: report.identifiers.whatsapp ? maskIdentifier(report.identifiers.whatsapp) : '',
            bkashNumber: report.identifiers.bkashNumber ? maskIdentifier(report.identifiers.bkashNumber) : '',
            nagadNumber: report.identifiers.nagadNumber ? maskIdentifier(report.identifiers.nagadNumber) : '',
            rocketNumber: report.identifiers.rocketNumber ? maskIdentifier(report.identifiers.rocketNumber) : '',
          },
      evidenceFiles: isModeratorOrAdmin || isOwner
        ? report.evidenceFiles
        : report.evidenceFiles.map((ev) => ({
            id: ev.id,
            originalFilename: ev.originalFilename,
            mimeType: ev.mimeType,
            fileSize: ev.fileSize,
            uploadedAt: ev.uploadedAt,
            // Only verified evidence or thumbnail shown
            fileUrl: ev.fileUrl,
          })),
    };

    return res.json({ success: true, report: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMyReports(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userReports = inAppDB.reports.filter(
      (r) => r.submittedBy.userId === req.user!.id || r.submittedBy.email === req.user!.email
    );

    return res.json({
      success: true,
      total: userReports.length,
      reports: userReports,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitDispute(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { claimantName, claimantEmail, claimantPhone, claimantRole, reason, details, evidenceUrls } =
      req.body;

    const report = inAppDB.reports.find(
      (r) => r.reportId.toLowerCase() === id.toLowerCase() || r.id === id
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (!claimantName || !claimantEmail || !reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, reason, and detailed explanation are required to file a dispute.',
      });
    }

    const disputeId = `DISP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const supportingEvidence: any[] = [];
    if (Array.isArray(evidenceUrls)) {
      evidenceUrls.forEach((url, i) => {
        supportingEvidence.push({
          id: `disp_ev_${Date.now()}_${i}`,
          originalFilename: `Dispute_Document_${i + 1}.png`,
          fileUrl: url,
        });
      });
    }

    const newDispute: DBDispute = {
      id: `disp_${Date.now()}`,
      disputeId,
      reportId: report.reportId,
      claimantName: claimantName.trim(),
      claimantEmail: claimantEmail.trim(),
      claimantPhone: claimantPhone || '',
      claimantRole: claimantRole || 'seller',
      reason: reason.trim(),
      details: details.trim(),
      supportingEvidence,
      status: 'pending',
      adminNotes: 'Dispute submitted. Awaiting moderation investigation.',
      createdAt: new Date().toISOString(),
    };

    inAppDB.disputes.unshift(newDispute);
    inAppDB.persistDispute(newDispute);

    // Update report status to disputed
    report.status = 'disputed';
    report.disputeCount = (report.disputeCount || 0) + 1;
    report.updatedAt = new Date().toISOString();
    inAppDB.persistReport(report);

    // Notify submitter if known
    if (report.submittedBy.userId) {
      const dispNotif = {
        id: `notif_${Date.now()}`,
        userId: report.submittedBy.userId,
        title: `Dispute Filed on ${report.reportId}`,
        message: `The reported party has formally filed an appeal/dispute regarding report ${report.reportId}. A moderator is reviewing the counter-evidence.`,
        type: 'dispute_update' as const,
        isRead: false,
        link: `/report/${report.reportId}`,
        createdAt: new Date().toISOString(),
      };
      inAppDB.notifications.unshift(dispNotif);
      inAppDB.persistNotification(dispNotif);
    }

    return res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully. Our team will review the claim within 48 business hours.',
      disputeId: newDispute.disputeId,
      reportStatus: report.status,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function addEvidence(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { fileUrl, originalFilename } = req.body;

    const report = inAppDB.reports.find(
      (r) => r.reportId.toLowerCase() === id.toLowerCase() || r.id === id
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File URL is required.' });
    }

    const newEv = {
      id: `ev_${Date.now()}`,
      originalFilename: originalFilename || 'Supplementary_Evidence.png',
      storageKey: `evidence/${report.reportId}/supp_${Date.now()}`,
      mimeType: 'image/png',
      fileSize: 310000,
      fileUrl,
      uploadedAt: new Date().toISOString(),
    };

    report.evidenceFiles.push(newEv);
    report.updatedAt = new Date().toISOString();
    inAppDB.persistReport(report);

    return res.json({
      success: true,
      message: 'Supplementary evidence attached successfully.',
      evidence: newEv,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
