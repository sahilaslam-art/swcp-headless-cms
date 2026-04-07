import express from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', verifyAuth, logout);

export default router;
