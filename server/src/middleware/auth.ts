import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils.js';

export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (decoded.type !== 'access') {
      return res.status(403).json({ success: false, message: 'Invalid token type' });
    }

    (req as any).userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
