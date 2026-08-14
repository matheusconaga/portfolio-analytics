import { Router } from "express";
import { prisma } from "../database/prisma.js";
import {
  AnalyticsPeriod,
  getPeriodStart,
} from "../utils/analytics-period.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/funnel", requireAuth, async (req, res) => {
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

        sessions: {
          where: periodStart
            ? {
              startedAt: {
                gte: periodStart,
              },
            }
            : undefined,

          select: {
            events: {
              where: periodStart
                ? {
                  createdAt: {
                    gte: periodStart,
                  },
                }
                : undefined,

              select: {
                type: true,
                metadata: true,
              },
            },
          },
        },
      },
    });

    let projectViews = 0;
    let projectInteractions = 0;
    let githubClicks = 0;
    let contactClicks = 0;

    for (const visitor of visitors) {
      const events = visitor.sessions.flatMap(
        (session) => session.events,
      );

      /*
       * Etapa 1
       *
       * Visitou a seção de projetos.
       */
      const viewedProjects = events.some(
        (event) =>
          event.type === "section_view" &&
          event.metadata &&
          typeof event.metadata === "object" &&
          "section" in event.metadata &&
          event.metadata.section === "projects",
      );

      if (!viewedProjects) {
        continue;
      }

      projectViews++;

      /*
       * Etapa 2
       *
       * Interagiu com algum projeto.
       */
      const interactedWithProject = events.some(
        (event) =>
          event.type === "github_click" ||
          event.type === "demo_click",
      );

      if (!interactedWithProject) {
        continue;
      }

      projectInteractions++;

      /*
       * Etapa 3
       *
       * Clicou no GitHub de algum projeto.
       */
      const clickedGithub = events.some(
        (event) => event.type === "github_click",
      );

      if (!clickedGithub) {
        continue;
      }

      githubClicks++;

      /*
       * Etapa 4
       *
       * Entrou em contato depois de
       * chegar até a etapa do GitHub.
       */
      const contacted = events.some(
        (event) =>
          event.type === "whatsapp_click" ||
          event.type === "email_click" ||
          event.type === "linkedin_click",
      );

      if (contacted) {
        contactClicks++;
      }
    }

    const percentage = (
      value: number,
      total: number,
    ) =>
      total > 0
        ? Number(((value / total) * 100).toFixed(2))
        : 0;

    const totalVisitors = visitors.length;

    res.json({
      period,
      periodStart: periodStart ?? null,

      visitors: totalVisitors,

      projectViews,
      projectInteractions,
      githubClicks,
      contactClicks,

      conversion: {
        visitorsToProjects: percentage(
          projectViews,
          totalVisitors,
        ),

        projectsToInteraction: percentage(
          projectInteractions,
          projectViews,
        ),

        interactionToGithub: percentage(
          githubClicks,
          projectInteractions,
        ),

        githubToContact: percentage(
          contactClicks,
          githubClicks,
        ),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch analytics funnel",
    });
  }
});

export default router;