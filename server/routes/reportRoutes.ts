import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  getMyReports,
  submitDispute,
  addEvidence,
} from '../controllers/reportController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';
import { uploadEvidence } from '../middleware/uploadMiddleware.ts';

const router = Router();

// Middleware to attach user if token provided, but allow guest report submission
const optionalAuth = (req: any, _res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    requireAuth(req, _res, () => next());
  } else {
    next();
  }
};

router.post('/', optionalAuth, uploadEvidence.array('evidence', 5), createReport);
router.get('/', getReports);
router.get('/my-reports', requireAuth, getMyReports);
router.get('/:id', optionalAuth, getReportById);
router.post('/:id/dispute', submitDispute);
router.post('/:id/evidence', optionalAuth, addEvidence);

export default router;
