import express from "express";
import Contact from "../models/Contact.js";
import Project from "../models/Project.js";
import Feedback from "../models/Feedback.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT verification to all admin routes
router.use(verifyAuth);

// ==================== MESSAGES ====================
router.get("/messages", async (req, res) => {
  try {
    const messages = await Contact.find({ user: (req as any).userId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    await Contact.findOneAndDelete({ _id: req.params.id, user: (req as any).userId });
    res.json({ message: "Message deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete message" });
  }
});

// ==================== PROJECTS ====================
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({ user: (req as any).userId }).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const { title, description, tech, liveUrl, githubUrl, image, featured, order } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    const project = new Project({ title, description, tech, liveUrl, githubUrl, image, featured, order, user: (req as any).userId });
    await project.save();
    res.status(201).json(project);
  } catch {
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.id, user: (req as any).userId }, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch {
    res.status(500).json({ message: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, user: (req as any).userId });
    res.json({ message: "Project deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

// ==================== FEEDBACK ====================
router.get("/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: (req as any).userId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { name, email, rating, message, designation, company, image } = req.body;
    if (!name || !rating || !message) {
      return res.status(400).json({ message: "Name, rating, and message are required" });
    }
    const feedback = new Feedback({ name, email, rating, message, designation, company, image, approved: false, user: (req as any).userId });
    await feedback.save();
    res.status(201).json(feedback);
  } catch {
    res.status(500).json({ message: "Failed to create feedback" });
  }
});

router.patch("/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndUpdate({ _id: req.params.id, user: (req as any).userId }, req.body, { new: true });
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch {
    res.status(500).json({ message: "Failed to update feedback" });
  }
});

router.delete("/feedback/:id", async (req, res) => {
  try {
    await Feedback.findOneAndDelete({ _id: req.params.id, user: (req as any).userId });
    res.json({ message: "Feedback deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete feedback" });
  }
});

// ==================== STATS (Dashboard) ====================
router.get("/stats", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [totalProjects, totalMessages, totalFeedback, approvedFeedback] = await Promise.all([
      Project.countDocuments({ user: userId }),
      Contact.countDocuments({ user: userId }),
      Feedback.countDocuments({ user: userId }),
      Feedback.countDocuments({ user: userId, approved: true }),
    ]);
    res.json({ totalProjects, totalMessages, totalFeedback, approvedFeedback, pendingFeedback: totalFeedback - approvedFeedback });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
