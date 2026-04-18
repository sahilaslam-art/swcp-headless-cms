import jwt, { SignOptions } from 'jsonwebtoken';

const getSecret = (): string => process.env.JWT_SECRET || 'fallback_secret';

export const generateAccessToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRE || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId, type: 'access' }, getSecret(), options);
};

export const generateRefreshToken = (
  userId: string,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string => {
  return jwt.sign({ userId, type: 'refresh' }, getSecret(), { expiresIn });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, getSecret());
};
