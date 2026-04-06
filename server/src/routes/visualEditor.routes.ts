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
    const updatedEdits = { ...currentEdits, ...edits };
    config.contentEdits = new Map(Object.entries(updatedEdits)) as any;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to save edits" });
  }
});

// Save to Draft
router.post("/drafts", async (req, res) => {
  try {
    const { edits } = req.body;
    let config = await WebsiteEdit.findOne({ user: (req as any).userId });
    if (!config) {
      config = new WebsiteEdit({ user: (req as any).userId, draftEdits: {} });
    }
    
    const currentDraft = config.draftEdits ? Object.fromEntries(config.draftEdits) : {};
    const newDraft = { ...currentDraft, ...edits };
    config.draftEdits = new Map(Object.entries(newDraft)) as any;
    
    await config.save();
    res.json({ success: true, draftEdits: config.draftEdits });
  } catch (error) {
    res.status(500).json({ message: "Failed to save draft" });
  }
});

// Publish (Snapshot current live -> history, then merge draft -> live)
router.post("/publish", async (req, res) => {
  try {
    let config = await WebsiteEdit.findOne({ user: (req as any).userId });
    if (!config) return res.status(404).json({ message: "Config not found" });

    const currentLive = config.contentEdits ? Object.fromEntries(config.contentEdits) : {};
    
    // 1. Save current live state as a historical snapshot
    const snapshot = { savedAt: new Date(), snapshot: currentLive };
    const history = config.history || [];
    history.unshift(snapshot);
    config.history = history.slice(0, 10) as any; // Keep max 10 versions

    // 2. Merge draftEdits into contentEdits (make it live)
    const currentDraft = config.draftEdits ? Object.fromEntries(config.draftEdits) : {};
    const mergedEdits = { ...currentLive, ...currentDraft };
    config.contentEdits = new Map(Object.entries(mergedEdits)) as any;
    config.draftEdits = new Map() as any; // Clear draft after publish
    config.isLive = true;
    
    await config.save();
    res.json({ success: true, message: "Changes published successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to publish" });
  }
});

// Restore from History (Rollback)
router.post("/restore/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    let config = await WebsiteEdit.findOne({ user: (req as any).userId });
    if (!config || !config.history || !config.history[index]) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    
    const snapshot = config.history[index].snapshot;
    config.contentEdits = new Map(snapshot) as any;
    await config.save();
    res.json({ success: true, message: `Restored to version ${index + 1}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore version" });
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
