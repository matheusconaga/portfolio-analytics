import { Router } from "express";
import { prisma } from "../database/prisma.js";
import {
  AnalyticsPeriod,
  getPeriodStart,
} from "../utils/analytics-period.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/visitors", requireAuth, async (req, res) => {
  try {
    const period =
      (req.query.period as AnalyticsPeriod) || "all";

    const validPeriods: AnalyticsPeriod[] = [
      "today",
      "7d",
      "30d",
      "all",
    ];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: "Invalid period",
        validPeriods,
      });
    }

    const periodStart = getPeriodStart(period);

    const visitors = await prisma.visitor.findMany({
      where: periodStart
        ? {
          sessions: {
            some: {
              startedAt: {
                gte: periodStart,
              },
            },
          },
        }
        : undefined,

      select: {
        id: true,
        createdAt: true,

        sessions: {
          where: periodStart
            ? {
              startedAt: {
                gte: periodStart,
              },
            }
            : undefined,

          select: {
            id: true,
            startedAt: true,
          },

          orderBy: {
            startedAt: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    const totalVisitors = visitors.length;

    let newVisitors = 0;
    let returningVisitors = 0;

    if (period === "all") {
      newVisitors = visitors.filter(
        (visitor) => visitor.sessions.length === 1,
      ).length;

      returningVisitors = visitors.filter(
        (visitor) => visitor.sessions.length > 1,
      ).length;
    } else {
      newVisitors = visitors.filter(
        (visitor) =>
          visitor.createdAt >= periodStart!,
      ).length;

      returningVisitors =
        totalVisitors - newVisitors;
    }

    const totalSessions = visitors.reduce(
      (total, visitor) =>
        total + visitor.sessions.length,
      0,
    );

    const averageSessionsPerVisitor =
      totalVisitors > 0
        ? Number(
          (
            totalSessions / totalVisitors
          ).toFixed(2),
        )
        : 0;

    res.json({
      period,
      periodStart: periodStart ?? null,

      totalVisitors,
      newVisitors,
      returningVisitors,

      totalSessions,
      averageSessionsPerVisitor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch visitor analytics",
    });
  }
});

export default router;