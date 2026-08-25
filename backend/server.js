import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import { query } from "./db.js";
import {
  register, login, logout, me,
  forgotPassword, resetPassword, authenticate, supabaseConfig
} from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${port}`;

app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "محاولات كثيرة. حاول مرة أخرى بعد قليل." }
});

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.post("/api/auth/register", authLimiter, register);
app.post("/api/auth/login", authLimiter, login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", authenticate, me);
app.get("/api/auth/supabase-config", supabaseConfig);
app.post("/api/auth/forgot-password", authLimiter, forgotPassword);
app.post("/api/auth/reset-password", authLimiter, resetPassword);

// Serve the store and authentication pages from public/.
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "حدث خطأ في الخادم." });
});

app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`);
});
