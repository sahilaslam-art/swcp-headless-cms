import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// PUBLIC: Get approved feedback (for portfolio frontend)
router.get("/", async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.approved === "true") {
      filter.approved = true;
    }
    const feedback = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json(feedback);
  } catch {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

export default router;
