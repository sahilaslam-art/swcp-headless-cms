import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

export const generateRefreshToken = (userId: string, expiresIn: string = '7d') => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
};
