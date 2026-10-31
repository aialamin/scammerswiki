import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { inAppDB, DBUser } from '../services/mockDatabase.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'scamalert_bd_secure_jwt_secret_2026';

export interface AuthenticatedRequest extends Request {
  user?: DBUser;
}

export function generateToken(user: DBUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = inAppDB.users.find((u) => u.id === decoded.id && u.isActive);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session invalid or expired.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function requireModerator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== 'moderator' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied. Moderator privileges required.' });
    }
    next();
  });
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
}
