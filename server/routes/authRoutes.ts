import { Router } from 'express';
import { register, login, getMe, forgotPassword } from '../controllers/authController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', (_req, res) => {
  return res.json({ success: true, message: 'Password has been updated.' });
});
router.get('/me', requireAuth, getMe);

export default router;
