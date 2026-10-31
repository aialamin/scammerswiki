import { Response } from 'express';
import { inAppDB, DBAuditLog } from '../services/mockDatabase.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export async function getDashboardStats(_req: AuthenticatedRequest, res: Response) {
  try {
    const stats = inAppDB.getStatistics();
    return res.json({
      success: true,
      stats: {
        ...stats,
        totalUsers: inAppDB.users.length,
        totalDisputes: inAppDB.disputes.length,
        pendingDisputes: inAppDB.disputes.filter((d) => d.status === 'pending').length,
        auditLogsCount: inAppDB.auditLogs.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getReports(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, category, search } = req.query;

    let list = [...inAppDB.reports];

    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    if (category && category !== 'all') {
      list = list.filter((r) => r.category === category);
    }

    if (search) {
      const q = (search as string).toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.reportId.toLowerCase().includes(q) ||
          r.productOrService.toLowerCase().includes(q) ||
          (r.identifiers.phone && r.identifiers.phone.includes(q)) ||
          (r.identifiers.bkashNumber && r.identifiers.bkashNumber.includes(q)) ||
          (r.identifiers.facebookPageName && r.identifiers.facebookPageName.toLowerCase().includes(q)) ||
          r.submittedBy.name.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      total: list.length,
      reports: list,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateReportStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;

    const report = inAppDB.reports.find((r) => r.reportId === id || r.id === id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const previousStatus = report.status;
    report.status = status;
    if (reviewNotes) report.reviewNotes = reviewNotes;
    if (rejectionReason) report.rejectionReason = rejectionReason;
    report.updatedAt = new Date().toISOString();
    inAppDB.persistReport(report);

    // Create Audit Log
    const admin = req.user!;
    const log: DBAuditLog = {
      id: `log_${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      action: 'UPDATE_REPORT_STATUS',
      targetId: report.reportId,
      targetType: 'report',
      description: `Changed status from "${previousStatus}" to "${status}". Note: ${reviewNotes || 'None'}`,
      metadata: { previousStatus, newStatus: status, reviewNotes },
      createdAt: new Date().toISOString(),
    };
    inAppDB.auditLogs.unshift(log);
    inAppDB.persistAuditLog(log);

    // Notify submitter
    if (report.submittedBy.userId) {
      let title = `Report Status Updated: ${report.reportId}`;
      let message = `Your report has been updated to "${status.replace('_', ' ').toUpperCase()}".`;
      if (status === 'verified_incident') {
        title = `Report Verified: ${report.reportId}`;
        message = 'Your scam report has been verified by our moderation team. Thank you for protecting the community.';
      } else if (status === 'rejected') {
        title = `Report Rejected: ${report.reportId}`;
        message = `Your report was not approved. Reason: ${rejectionReason || 'Insufficient supporting documentation'}.`;
      }

      const notifItem = {
        id: `notif_${Date.now()}`,
        userId: report.submittedBy.userId,
        title,
        message,
        type: 'report_status' as const,
        isRead: false,
        link: `/report/${report.reportId}`,
        createdAt: new Date().toISOString(),
      };
      inAppDB.notifications.unshift(notifItem);
      inAppDB.persistNotification(notifItem);
    }

    return res.json({
      success: true,
      message: `Report status updated to ${status}.`,
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateReportDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { productOrService, incidentDescription, isPublic } = req.body;

    const report = inAppDB.reports.find((r) => r.reportId === id || r.id === id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (productOrService) report.productOrService = productOrService;
    if (incidentDescription) report.incidentDescription = incidentDescription;
    if (typeof isPublic === 'boolean') report.isPublic = isPublic;
    report.updatedAt = new Date().toISOString();
    inAppDB.persistReport(report);

    const admin = req.user!;
    const editLog: DBAuditLog = {
      id: `log_${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      action: 'EDIT_REPORT_DETAILS',
      targetId: report.reportId,
      targetType: 'report',
      description: `Moderator edited/redacted public content on report ${report.reportId}.`,
      createdAt: new Date().toISOString(),
    };
    inAppDB.auditLogs.unshift(editLog);
    inAppDB.persistAuditLog(editLog);

    return res.json({
      success: true,
      message: 'Report details updated and logged.',
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUsers(_req: AuthenticatedRequest, res: Response) {
  try {
    const safeUsers = inAppDB.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      isVerified: u.isVerified,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return res.json({
      success: true,
      total: safeUsers.length,
      users: safeUsers,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = inAppDB.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (role && ['user', 'moderator', 'admin'].includes(role)) user.role = role;
    inAppDB.persistUser(user);

    const admin = req.user!;
    const usrLog: DBAuditLog = {
      id: `log_${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      action: 'UPDATE_USER_STATUS',
      targetId: user.id,
      targetType: 'user',
      description: `Updated user ${user.email}: active=${user.isActive}, role=${user.role}`,
      createdAt: new Date().toISOString(),
    };
    inAppDB.auditLogs.unshift(usrLog);
    inAppDB.persistAuditLog(usrLog);

    return res.json({
      success: true,
      message: 'User status updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDisputes(_req: AuthenticatedRequest, res: Response) {
  try {
    return res.json({
      success: true,
      total: inAppDB.disputes.length,
      disputes: inAppDB.disputes,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function resolveDispute(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // 'resolved_upheld' | 'resolved_removed' | 'under_review'

    const dispute = inAppDB.disputes.find((d) => d.id === id || d.disputeId === id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute record not found' });
    }

    dispute.status = status;
    if (adminNotes) dispute.adminNotes = adminNotes;
    inAppDB.persistDispute(dispute);

    const report = inAppDB.reports.find((r) => r.reportId === dispute.reportId);
    if (report) {
      if (status === 'resolved_removed') {
        report.status = 'rejected';
        report.rejectionReason = 'Dispute resolved in favor of merchant. Proof of delivery or genuine transaction confirmed.';
      } else if (status === 'resolved_upheld') {
        report.status = 'verified_incident';
        report.reviewNotes = 'Dispute dismissed after reviewing merchant claims. Allegation upheld.';
      }
      report.updatedAt = new Date().toISOString();
      inAppDB.persistReport(report);
    }

    const admin = req.user!;
    const dispLog: DBAuditLog = {
      id: `log_${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      action: 'RESOLVE_DISPUTE',
      targetId: dispute.disputeId,
      targetType: 'dispute',
      description: `Resolved dispute ${dispute.disputeId} with status ${status}. Admin note: ${adminNotes || 'None'}`,
      createdAt: new Date().toISOString(),
    };
    inAppDB.auditLogs.unshift(dispLog);
    inAppDB.persistAuditLog(dispLog);

    return res.json({
      success: true,
      message: 'Dispute resolved successfully.',
      dispute,
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAuditLogs(_req: AuthenticatedRequest, res: Response) {
  try {
    return res.json({
      success: true,
      total: inAppDB.auditLogs.length,
      logs: inAppDB.auditLogs.slice(0, 50),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
