import { Router } from "express";

import { prisma } from "../database/prisma.js";

import {
  AnalyticsPeriod,
  getPeriodStart,
} from "../utils/analytics-period.js";

import {
  requireAuth,
} from "../middlewares/auth.middleware.js";

const router = Router();

interface AnalyticsComparison {
  visitors: number;
  sessions: number;
  pageViews: number;
  projectViews: number;

  githubClicks: number;
  demoClicks: number;
  linkedinClicks: number;
  whatsappClicks: number;
  emailClicks: number;
  resumeDownloads: number;

  visitorsPercentage: number | null;
  sessionsPercentage: number | null;
  pageViewsPercentage: number | null;
  projectViewsPercentage: number | null;

  githubClicksPercentage: number | null;
  demoClicksPercentage: number | null;
  linkedinClicksPercentage: number | null;
  whatsappClicksPercentage: number | null;
  emailClicksPercentage: number | null;
  resumeDownloadsPercentage: number | null;
}

function calculatePercentage(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null;
  }

  return Number(
    (
      ((current - previous) /
        previous) *
      100
    ).toFixed(2),
  );
}

function getPreviousPeriod(
  period: AnalyticsPeriod,
  currentStart: Date | undefined,
): {
  start: Date;
  end: Date;
} | null {
  if (!currentStart) {
    return null;
  }

  const end = new Date(
    currentStart,
  );

  const start = new Date(
    currentStart,
  );

  switch (period) {
    case "today":
      start.setDate(
        start.getDate() - 1,
      );
      break;

    case "7d":
      start.setDate(
        start.getDate() - 7,
      );
      break;

    case "30d":
      start.setDate(
        start.getDate() - 30,
      );
      break;

    case "all":
    default:
      return null;
  }

  return {
    start,
    end,
  };
}

router.get(
  "/stats",
  requireAuth,
  async (req, res) => {
    try {
      const period =
        (req.query.period as AnalyticsPeriod) ||
        "all";

      const validPeriods: AnalyticsPeriod[] =
        [
          "today",
          "7d",
          "30d",
          "all",
        ];

      if (
        !validPeriods.includes(
          period,
        )
      ) {
        return res.status(400).json({
          error: "Invalid period",
          validPeriods,
        });
      }

      const periodStart =
        getPeriodStart(period);

      const previousPeriod =
        getPreviousPeriod(
          period,
          periodStart,
        );

      /* =====================================================
         CURRENT PERIOD
      ===================================================== */

      const eventWhere = periodStart
        ? {
            createdAt: {
              gte: periodStart,
            },
          }
        : {};

      const sessionWhere = periodStart
        ? {
            startedAt: {
              gte: periodStart,
            },
          }
        : {};

      const [
        visitors,
        sessions,
        pageViews,
        projectViews,
        githubClicks,
        demoClicks,
        linkedinClicks,
        whatsappClicks,
        emailClicks,
        resumeDownloads,
      ] = await Promise.all([
        prisma.visitor.count({
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
        }),

        prisma.session.count({
          where: sessionWhere,
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "page_view",
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "section_view",
            metadata: {
              path: ["section"],
              equals: "projects",
            },
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "github_click",
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "demo_click",
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "linkedin_click",
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "whatsapp_click",
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "email_click",
          },
        }),

        prisma.event.count({
          where: {
            ...eventWhere,
            type: "resume_download",
          },
        }),

      ]);

      /* =====================================================
         PREVIOUS PERIOD
      ===================================================== */

      let comparison:
        | AnalyticsComparison
        | null = null;

      if (previousPeriod) {
        const previousEventWhere = {
          createdAt: {
            gte: previousPeriod.start,
            lt: previousPeriod.end,
          },
        };

        const previousSessionWhere = {
          startedAt: {
            gte: previousPeriod.start,
            lt: previousPeriod.end,
          },
        };

        const [
          previousVisitors,
          previousSessions,
          previousPageViews,
          previousProjectViews,
          previousGithubClicks,
          previousDemoClicks,
          previousLinkedinClicks,
          previousWhatsappClicks,
          previousEmailClicks,
          previousResumeDownloads,
        ] = await Promise.all([
          prisma.visitor.count({
            where: {
              sessions: {
                some: {
                  startedAt: {
                    gte: previousPeriod.start,
                    lt: previousPeriod.end,
                  },
                },
              },
            },
          }),

          prisma.session.count({
            where: previousSessionWhere,
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "page_view",
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "section_view",
              metadata: {
                path: ["section"],
                equals: "projects",
              },
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "github_click",
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "demo_click",
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "linkedin_click",
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "whatsapp_click",
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "email_click",
            },
          }),

          prisma.event.count({
            where: {
              ...previousEventWhere,
              type: "resume_download",
            },
          }),
        ]);

        comparison = {
          visitors:
            previousVisitors,

          sessions:
            previousSessions,

          pageViews:
            previousPageViews,

          projectViews:
            previousProjectViews,

          githubClicks:
            previousGithubClicks,

          demoClicks:
            previousDemoClicks,

          linkedinClicks:
            previousLinkedinClicks,

          whatsappClicks:
            previousWhatsappClicks,

          emailClicks:
            previousEmailClicks,

          resumeDownloads:
            previousResumeDownloads,

          visitorsPercentage:
            calculatePercentage(
              visitors,
              previousVisitors,
            ),

          sessionsPercentage:
            calculatePercentage(
              sessions,
              previousSessions,
            ),

          pageViewsPercentage:
            calculatePercentage(
              pageViews,
              previousPageViews,
            ),

          projectViewsPercentage:
            calculatePercentage(
              projectViews,
              previousProjectViews,
            ),

          githubClicksPercentage:
            calculatePercentage(
              githubClicks,
              previousGithubClicks,
            ),

          demoClicksPercentage:
            calculatePercentage(
              demoClicks,
              previousDemoClicks,
            ),

          linkedinClicksPercentage:
            calculatePercentage(
              linkedinClicks,
              previousLinkedinClicks,
            ),

          whatsappClicksPercentage:
            calculatePercentage(
              whatsappClicks,
              previousWhatsappClicks,
            ),

          emailClicksPercentage:
            calculatePercentage(
              emailClicks,
              previousEmailClicks,
            ),

            resumeDownloadsPercentage:
              calculatePercentage(
                resumeDownloads,
                previousResumeDownloads,
              ),
        };
      }

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.json({
        period,
        periodStart:
          periodStart ?? null,

        visitors,
        sessions,
        pageViews,
        projectViews,

        githubClicks,
        demoClicks,
        linkedinClicks,
        whatsappClicks,
        emailClicks,
        resumeDownloads,

        comparison,
      });
    } catch (error) {
      console.error(
        "Failed to fetch analytics stats:",
        error,
      );

      return res.status(500).json({
        error:
          "Failed to fetch analytics stats",
      });
    }
  },
);

export default router;