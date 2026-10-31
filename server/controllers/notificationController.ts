import { Response } from 'express';
import { inAppDB } from '../services/mockDatabase.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const notifs = inAppDB.notifications
      .filter((n) => n.userId === req.user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      total: notifs.length,
      unreadCount: notifs.filter((n) => !n.isRead).length,
      notifications: notifs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const notif = inAppDB.notifications.find(
      (n) => n.id === id && (!req.user || n.userId === req.user.id)
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;

    return res.json({ success: true, message: 'Marked as read', notification: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    inAppDB.notifications
      .filter((n) => n.userId === req.user!.id)
      .forEach((n) => {
        n.isRead = true;
      });

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
