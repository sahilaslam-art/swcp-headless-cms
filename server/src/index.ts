import contactRoutes from "./routes/contact.routes.js";
import projectRoutes from "./routes/project.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import publicRoutes from "./routes/public.routes.js";
import visualEditorRoutes from "./routes/visualEditor.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import sdkRoutes from "./routes/sdk.routes.js";
import path from "path";
import { fileURLToPath } from "url";

//connect database
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Serve static SDK
app.use(express.static(path.join(__dirname, "../public")));

// middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, "") === normalizedOrigin);

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/feedback", feedbackRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/visual-editor", visualEditorRoutes);
app.use("/api/analytics", analyticsRoutes);

// Public Headless CMS routes
app.use("/api/public", publicRoutes);

// Dynamic SDK Serving (Replaces static SDK serving for production URL injection)
app.use("/", sdkRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend server is running 🚀");
});

const PORT = process.env.PORT || 5000;
//connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
