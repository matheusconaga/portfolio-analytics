import { Router } from "express";

import { prisma } from "../database/prisma.js";

import {
  AnalyticsPeriod,
  getPeriodStart,
} from "../utils/analytics-period.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

interface TimelineDay {
  date: string;
  visitors: Set<string>;
  sessions: number;
  pageViews: number;
  projectViews: number;
}

router.get(
  "/timeline",
  requireAuth,
  async (req, res) => {
    try {
      const period =
        (req.query.period as AnalyticsPeriod) ||
        "7d";

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

      const periodStart =
        getPeriodStart(period);

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
        sessions,
        events,
      ] = await Promise.all([
        prisma.session.findMany({
          where: sessionWhere,
          select: {
            visitorId: true,
            startedAt: true,
          },
        }),

        prisma.event.findMany({
          where: eventWhere,
          select: {
            type: true,
            metadata: true,
            createdAt: true,
          },
        }),
      ]);

      const timeline =
        new Map<string, TimelineDay>();

      function formatDate(
        date: Date,
      ): string {
        return date
          .toISOString()
          .slice(0, 10);
      }

      function createDay(
        date: Date,
      ): TimelineDay {
        return {
          date: formatDate(date),
          visitors: new Set<string>(),
          sessions: 0,
          pageViews: 0,
          projectViews: 0,
        };
      }

      function getDay(
        date: Date,
      ): TimelineDay {
        const key =
          formatDate(date);

        let day =
          timeline.get(key);

        if (!day) {
          day = createDay(date);

          timeline.set(
            key,
            day,
          );
        }

        return day;
      }

      /*
       * Inicializa todos os dias
       * do período com zero.
       */
      if (periodStart) {
        const current =
          new Date(periodStart);

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0,
        );

        while (
          current <= today
        ) {
          const day =
            createDay(current);

          timeline.set(
            day.date,
            day,
          );

          current.setDate(
            current.getDate() + 1,
          );
        }
      }

      /*
       * Sessões e visitantes
       */
      for (const session of sessions) {
        const day =
          getDay(
            session.startedAt,
          );

        day.sessions += 1;

        day.visitors.add(
          session.visitorId,
        );
      }

      /*
       * Eventos
       */
      for (const event of events) {
        const day =
          getDay(
            event.createdAt,
          );

        /*
         * Page views
         */
        if (
          event.type ===
          "page_view"
        ) {
          day.pageViews += 1;
        }

        /*
         * Project views
         *
         * Mesma regra usada
         * pelo endpoint /stats.
         */
        if (
          event.type ===
            "section_view" &&
          event.metadata &&
          typeof event.metadata ===
            "object" &&
          !Array.isArray(
            event.metadata,
          ) &&
          event.metadata.section ===
            "projects"
        ) {
          day.projectViews += 1;
        }
      }

      const data =
        Array.from(
          timeline.values(),
        )
          .sort((a, b) =>
            a.date.localeCompare(
              b.date,
            ),
          )
          .map((day) => ({
            date: day.date,
            visitors:
              day.visitors.size,
            sessions:
              day.sessions,
            pageViews:
              day.pageViews,
            projectViews:
              day.projectViews,
          }));

      return res.json({
        period,
        periodStart:
          periodStart ?? null,
        data,
      });
    } catch (error) {
      console.error(
        "Failed to fetch analytics timeline:",
        error,
      );

      return res.status(500).json({
        error:
          "Failed to fetch analytics timeline",
      });
    }
  },
);

export default router;