import { Router } from "express";
import authRoutes from "./auth.routes.js";
import environmentalRoutes from "./environmental.routes.js";
import socialRoutes from "./social.routes.js";
import governanceRoutes from "./governance.routes.js";
import gamificationRoutes from "./gamification.routes.js";
import reportsRoutes from "./reports.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

// ── Mount all module routers ──────────────────

router.use("/auth", authRoutes);
router.use("/", environmentalRoutes);
router.use("/", socialRoutes);
router.use("/", governanceRoutes);
router.use("/", gamificationRoutes);
router.use("/", reportsRoutes);
router.use("/", adminRoutes);

// ── Health check ──────────────────────────────

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
});

export default router;
