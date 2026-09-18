import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { db } from '../database/db';
import { Business } from '../types';

const router = Router();
router.use(authMiddleware);

// Get current business profile
router.get('/', (req: AuthRequest, res: Response) => {
  const business = db.businesses.find(b => b.userId === req.user!.id);
  if (!business) {
    return res.status(404).json({ success: false, message: 'No business found.', code: 'NOT_FOUND' });
  }
  res.json({ success: true, data: business });
});

// Update business profile
router.put('/', (req: AuthRequest, res: Response) => {
  try {
    let business = db.businesses.find(b => b.userId === req.user!.id);
    const now = new Date().toISOString();

    if (!business) {
      business = {
        id: `biz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: req.user!.id,
        businessName: req.body.businessName || `${req.user!.name}'s Enterprise`,
        ownerName: req.user!.name,
        businessType: req.body.businessType || 'Retail',
        category: req.body.category || 'Retail Stores',
        phone: req.body.phone || req.user!.phone || '',
        email: req.body.email || req.user!.email,
        address: req.body.address || 'Tamil Nadu',
        district: req.body.district || 'Madurai',
        state: 'Tamil Nadu',
        preferredLanguage: req.body.preferredLanguage || 'ta',
        currency: req.body.currency || 'INR',
        gstin: req.body.gstin || '',
        createdAt: now,
        updatedAt: now
      };
    } else {
      Object.assign(business, {
        ...req.body,
        updatedAt: now
      });
    }

    db.saveBusiness(business);
    res.json({ success: true, data: business });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'UPDATE_ERROR' });
  }
});

export default router;
