import express from "express";
import WebsiteEdit from "../models/WebsiteEdit.js";

const router = express.Router();

// Public endpoint hit by sdk.js running on an external domain
router.get("/edits/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const config = await WebsiteEdit.findOne({ user: userId });
    
    if (!config || !config.isLive) {
      return res.json({ edits: {} });
    }

    res.json({
      edits: config.contentEdits || {},
      isLive: config.isLive
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch website configuration" });
  }
});

export default router;
