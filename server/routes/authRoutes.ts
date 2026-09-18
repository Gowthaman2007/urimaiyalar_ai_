import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/db';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';
import { User, Business } from '../types';

const router = Router();

// Register new user & create initial business profile
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, businessName, businessType, category, district, preferredLanguage } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
        code: 'EMAIL_EXISTS'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const newUser: User = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'OWNER',
      phone: phone || '',
      createdAt: now,
      updatedAt: now
    };
    db.saveUser(newUser);

    const newBusiness: Business = {
      id: `biz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: newUser.id,
      businessName: businessName || `${name}'s Store`,
      ownerName: name,
      businessType: businessType || 'Retail Grocery',
      category: category || 'Grocery & Provisions',
      phone: phone || '',
      address: district ? `${district}, Tamil Nadu` : 'Tamil Nadu, India',
      district: district || 'Madurai',
      state: 'Tamil Nadu',
      preferredLanguage: preferredLanguage || 'ta',
      currency: 'INR',
      isDemo: false,
      createdAt: now,
      updatedAt: now
    };
    db.saveBusiness(newBusiness);

    const token = generateToken(newUser, newBusiness.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      },
      business: newBusiness
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Registration failed.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
        code: 'CREDENTIALS_REQUIRED'
      });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const business = db.businesses.find(b => b.userId === user.id) || null;
    const token = generateToken(user, business?.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      business
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Login failed.',
      code: 'LOGIN_ERROR'
    });
  }
});

// Current User & Business Info
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const business = db.businesses.find(b => b.userId === user.id) || null;

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    },
    business
  });
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
