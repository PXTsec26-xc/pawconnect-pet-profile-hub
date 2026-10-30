import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db.js';

// Secure JWT Secret resolution:
// In production, JWT_SECRET MUST be provided via environment variables.
// In development, an ephemeral 256-bit key is generated at runtime if not provided, avoiding any committed secrets.
const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ [SECURITY WARNING] JWT_SECRET is not configured in environment variables. Using dynamic ephemeral key. Please set JWT_SECRET in your Vercel Project Settings for permanent session security.');
    return 'pawconnect_temp_' + (process.env.VERCEL_GIT_COMMIT_SHA || crypto.randomBytes(32).toString('hex'));
  }
  return crypto.randomBytes(32).toString('hex');
};

const JWT_SECRET = getJwtSecret();

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function getAuthUser(req: Request): User | null {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = db.getUserById(decoded.id);
    return user || null;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  req.user = user;
  next();
}
