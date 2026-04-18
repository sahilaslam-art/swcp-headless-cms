import dotenv from "dotenv";
dotenv.config();

// Node builtins
import path from "path";
import { fileURLToPath } from "url";

// Third-party
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Local — config
import connectDB from "./config/db.js";

// Local — routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import projectRoutes from "./routes/project.routes.js";
import publicRoutes from "./routes/public.routes.js";
import sdkRoutes from "./routes/sdk.routes.js";
import userRoutes from "./routes/user.routes.js";
import visualEditorRoutes from "./routes/visualEditor.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// Static assets
app.use(express.static(path.join(__dirname, "../public")));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(
      (o) => o.replace(/\/$/, "") === normalizedOrigin
    );
    if (isAllowed || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

// Body parsers
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/public", publicRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/visual-editor", visualEditorRoutes);
app.use("/api/analytics", analyticsRoutes);

// SDK — must be last
app.use("/", sdkRoutes);

// Database & server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
