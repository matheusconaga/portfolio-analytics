import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import analyticsRoutes from "./routes/analytics.routes.js";
import analyticsStatsRoutes from "./routes/analytics-stats.routes.js";
import analyticsProjectsRoutes from "./routes/analytics-projects.routes.js";
import analyticsFunnelRoutes from "./routes/analytics-funnel.routes.js";
import analyticsVisitorsRoutes from "./routes/analytics-visitors.routes.js";
import analyticsTimelineRoutes from "./routes/analytics-timeline.routes.js";
import analyticsReferrersRoutes from "./routes/analytics-referrers.js";
import analyticsDevicesRoutes from "./routes/analytics-devices.js";
import analyticsHoursRoutes from "./routes/analytics-hours.js";
import analyticsActivityRoutes from "./routes/analytics-activity.js";
import analyticsEngagementRoutes from "./routes/analytics-engagement.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const PORT = process.env.PORT || 3000;

// GLOBAL MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// ANALYTICS ROUTES
app.use("/api/analytics", analyticsRoutes);
app.use("/api/analytics", analyticsStatsRoutes);
app.use("/api/analytics", analyticsProjectsRoutes);
app.use("/api/analytics", analyticsFunnelRoutes);
app.use("/api/analytics", analyticsVisitorsRoutes);
app.use("/api/analytics", analyticsTimelineRoutes);
app.use("/api/analytics", analyticsReferrersRoutes);
app.use("/api/analytics", analyticsDevicesRoutes);
app.use("/api/analytics", analyticsHoursRoutes);
app.use("/api/analytics", analyticsActivityRoutes);
app.use("/api/analytics", analyticsEngagementRoutes);

app.get("/api/health", async (_req, res) => {
  res.json({
    status: "ok",
    service: "portfolio-analytics-api",
    database: "connected",
  });
});

app.listen(PORT, () => {
  console.log(
    `Analytics API running on port ${PORT}`,
  );
});