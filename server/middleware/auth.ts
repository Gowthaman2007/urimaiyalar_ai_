import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { User } from '../types';

const JWT_SECRET = process.env.SESSION_SECRET || 'urimaiyalar_secure_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: User;
  businessId?: string;
}

export function generateToken(user: User, businessId?: string): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: businessId || null,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      businessId?: string;
    };

    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid or expired.',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;

    // Locate active business for user
    if (decoded.businessId) {
      const biz = db.businesses.find(b => b.id === decoded.businessId && b.userId === user.id);
      if (biz) {
        req.businessId = biz.id;
      }
    }

    if (!req.businessId) {
      const defaultBiz = db.businesses.find(b => b.userId === user.id);
      if (defaultBiz) {
        req.businessId = defaultBiz.id;
      }
    }

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      code: 'INVALID_TOKEN'
    });
  }
}

export function requireBusiness(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.businessId) {
    return res.status(400).json({
      success: false,
      message: 'No active business found. Please complete business onboarding.',
      code: 'BUSINESS_REQUIRED'
    });
  }
  next();
}
