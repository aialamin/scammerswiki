import { Router } from 'express';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markAsRead);
router.patch('/read-all', requireAuth, markAllRead);

export default router;
