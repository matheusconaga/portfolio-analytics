import { Router } from "express";
import { prisma } from "../database/prisma.js";
import {
  AnalyticsPeriod,
  getPeriodStart,
} from "../utils/analytics-period.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/projects", requireAuth, async (req, res) => {
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

    const events = await prisma.event.findMany({
      where: {
        ...(periodStart
          ? {
              createdAt: {
                gte: periodStart,
              },
            }
          : {}),

        projectSlug: {
          not: null,
        },

        type: {
          in: ["github_click", "demo_click"],
        },
      },

      select: {
        projectSlug: true,
        type: true,
      },
    });

    const projects = Object.values(
      events.reduce(
        (acc, event) => {
          const slug = event.projectSlug!;

          if (!acc[slug]) {
            acc[slug] = {
              projectSlug: slug,
              githubClicks: 0,
              demoClicks: 0,
              totalClicks: 0,
            };
          }

          if (event.type === "github_click") {
            acc[slug].githubClicks++;
          }

          if (event.type === "demo_click") {
            acc[slug].demoClicks++;
          }

          acc[slug].totalClicks++;

          return acc;
        },
        {} as Record<
          string,
          {
            projectSlug: string;
            githubClicks: number;
            demoClicks: number;
            totalClicks: number;
          }
        >,
      ),
    );

    projects.sort(
      (a, b) => b.totalClicks - a.totalClicks,
    );

    res.json({
      period,
      periodStart: periodStart ?? null,
      projects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch project analytics",
    });
  }
});

export default router;