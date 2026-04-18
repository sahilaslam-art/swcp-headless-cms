import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/tokenUtils.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
  maxAge: 7 * 24 * 60 * 60 * 1000, 
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email or username already exists' });

    const user = new User({ email, username, password, role: 'admin' });
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.status(201).json({
      success: true,
      data: { userId: user._id, email: user.email, username: user.username, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshToken');
    
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.status(200).json({
      success: true,
      data: { userId: user._id, email: user.email, username: user.username, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = verifyToken(refreshToken);
    if (decoded.type !== 'refresh') return res.status(403).json({ success: false, message: 'Invalid token type' });

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, getCookieOptions());
    res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error: any) {
    res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    res.clearCookie('refreshToken', getCookieOptions());
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
