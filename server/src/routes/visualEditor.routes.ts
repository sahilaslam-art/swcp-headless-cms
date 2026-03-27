import express from "express";
import WebsiteEdit from "../models/WebsiteEdit.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyAuth);

// Get current configuration
router.get("/config", async (req, res) => {
  try {
    let config = await WebsiteEdit.findOne({ user: (req as any).userId });
    if (!config) {
      config = await WebsiteEdit.create({ user: (req as any).userId });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch config" });
  }
});

// Update domain
router.put("/domain", async (req, res) => {
  try {
    const { domain } = req.body;
    const config = await WebsiteEdit.findOneAndUpdate(
      { user: (req as any).userId },
      { domain },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to update domain" });
  }
});

// Save content edits (called by admin panel auto-save endpoint)
router.post("/edits", async (req, res) => {
  try {
    const { edits } = req.body; 

    let config = await WebsiteEdit.findOne({ user: (req as any).userId });
    if (!config) {
      config = new WebsiteEdit({ user: (req as any).userId, contentEdits: {} });
    }
    
    const currentEdits = config.contentEdits ? Object.fromEntries(config.contentEdits) : {};
    config.contentEdits = { ...currentEdits, ...edits };

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to save edits" });
  }
});

// Hard remove a specific edit mapping 
router.delete("/edits", async (req, res) => {
  try {
    const { selector } = req.body;
    const config = await WebsiteEdit.findOne({ user: (req as any).userId });
    if (!config || !config.contentEdits) return res.status(404).json({ message: "Not found" });
    
    config.contentEdits.delete(selector);
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete edit" });
  }
});

export default router;
