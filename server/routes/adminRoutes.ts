import { Router } from 'express';
import {
  getDashboardStats,
  getReports,
  updateReportStatus,
  updateReportDetails,
  getUsers,
  updateUserStatus,
  getDisputes,
  resolveDispute,
  getAuditLogs,
} from '../controllers/adminController.ts';
import { requireModerator, requireAdmin } from '../middleware/authMiddleware.ts';

const router = Router();

// Stats accessible to moderators and admins
router.get('/dashboard', requireModerator, getDashboardStats);
router.get('/reports', requireModerator, getReports);
router.patch('/reports/:id/status', requireModerator, updateReportStatus);
router.patch('/reports/:id/details', requireModerator, updateReportDetails);

// Disputes accessible to moderators and admins
router.get('/disputes', requireModerator, getDisputes);
router.patch('/disputes/:id/resolve', requireModerator, resolveDispute);

// User management and Audit Logs require full Admin role
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:id/status', requireAdmin, updateUserStatus);
router.get('/audit-logs', requireAdmin, getAuditLogs);

export default router;
