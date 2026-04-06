import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret';

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId, type: 'access' }, JWT_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRE || '15m') as any,
  } as any);
};

export const generateRefreshToken = (userId: string, expiresIn: string = '7d') => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: expiresIn as any,
  } as any);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
};
