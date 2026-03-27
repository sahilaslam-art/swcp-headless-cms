import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// PUBLIC: Get all projects (for portfolio frontend)
router.get("/", async (_req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

export default router;
