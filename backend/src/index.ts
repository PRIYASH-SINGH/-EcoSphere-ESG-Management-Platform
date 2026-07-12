import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRouter from "./routes/index.js";

// ── Create Express app ────────────────────────

const app = express();

// ── Global middleware ─────────────────────────

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ──────────────────────

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── API routes ────────────────────────────────

app.use("/api", apiRouter);

// ── 404 handler ───────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// ── Global error handler ──────────────────────

app.use(errorHandler);

// ── Start server ──────────────────────────────

app.listen(env.PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║  🌿 EcoSphere ESG Backend                    ║
  ║  Running on http://localhost:${env.PORT}            ║
  ║  Health check: http://localhost:${env.PORT}/api/health ║
  ║  Mode: PostgreSQL via Prisma (Neon)           ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
