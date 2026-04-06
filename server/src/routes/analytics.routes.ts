import express from 'express';
import Analytics from '../models/Analytics.js';
import WebsiteEdit from '../models/WebsiteEdit.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// PUBLIC: SDK pings this on every page load (no auth, uses userId from URL param)
router.get('/ping/:userId', async (req, res) => {
  try {
    await Analytics.findOneAndUpdate(
      { user: req.params.userId },
      { $inc: { pageViews: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// PRIVATE: Admin fetches their own analytics
router.get('/stats', verifyAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [analytics, websiteEdit] = await Promise.all([
      Analytics.findOne({ user: userId }),
      WebsiteEdit.findOne({ user: userId }),
    ]);
    
    // Convert edits Map to object to check count
    const liveEdits = websiteEdit?.contentEdits ? Object.fromEntries(websiteEdit.contentEdits) : {};
    const draftEdits = websiteEdit?.draftEdits ? Object.fromEntries(websiteEdit.draftEdits) : {};
    
    const editCount = Object.keys(liveEdits).length;
    const draftCount = Object.keys(draftEdits).length;
    const sdkActive = !!(websiteEdit?.domain);
    
    res.json({
      pageViews: analytics?.pageViews || 0,
      lastVisit: analytics?.lastVisit || null,
      editCount,
      draftCount,
      sdkActive,
      domain: websiteEdit?.domain || null,
    });
  } catch {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;
