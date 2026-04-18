import express from 'express';
import { getProfile } from '../controllers/auth.controller.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user/profile
router.get('/profile', verifyAuth, getProfile);

export default router;
