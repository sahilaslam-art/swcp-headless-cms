import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
  maxAge: 7 * 24 * 60 * 60 * 1000, 
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    console.log(`[AUTH] Registration attempt: ${email}`);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log(`[AUTH] Registration failed: User exists ${email}`);
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    }

    const user = new User({ email, username, password, role: 'admin' });
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    console.log(`[AUTH] Registration successful: ${email}`);
    res.status(201).json({
      success: true,
      data: { userId: user._id, email: user.email, username: user.username, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error(`[AUTH] Registration error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt: ${email}`);

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
       console.log(`[AUTH] Login failed: User not found ${email}`);
       return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
       console.log(`[AUTH] Login failed: Wrong password for ${email}`);
       return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    console.log(`[AUTH] Login successful: ${email}`);
    res.json({
      success: true,
      data: { userId: user._id, email: user.email, username: user.username, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error(`[AUTH] Login error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const user = await User.findOne({ refreshToken }).select('+refreshToken');
    if (!user) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    
    const { maxAge, ...clearOptions } = getCookieOptions();
    res.clearCookie('refreshToken', clearOptions);
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
