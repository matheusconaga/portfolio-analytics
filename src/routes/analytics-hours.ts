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

interface HourData {
  hour: number;
  sessions: number;
  visitors: Set<string>;
}

router.get(
  "/hours",
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

      const sessions =
        await prisma.session.findMany({
          where: periodStart
            ? {
                startedAt: {
                  gte: periodStart,
                },
              }
            : undefined,

          select: {
            visitorId: true,
            startedAt: true,
          },
        });

      /*
       * Criamos todas as 24 horas,
       * inclusive aquelas sem sessões.
       */
      const hours = new Map<
        number,
        HourData
      >();

      for (
        let hour = 0;
        hour < 24;
        hour++
      ) {
        hours.set(hour, {
          hour,
          sessions: 0,
          visitors:
            new Set<string>(),
        });
      }

      /*
       * O banco armazena DateTime.
       *
       * Aqui usamos o horário do Brasil
       * (UTC-3) para o dashboard não
       * exibir os acessos deslocados
       * em três horas.
       */
      for (const session of sessions) {
        const brazilTime =
          new Date(
            session.startedAt.getTime() -
              3 * 60 * 60 * 1000,
          );

        const hour =
          brazilTime.getUTCHours();

        const item =
          hours.get(hour);

        if (!item) {
          continue;
        }

        item.sessions += 1;

        item.visitors.add(
          session.visitorId,
        );
      }

      const data =
        Array.from(
          hours.values(),
        ).map((item) => ({
          hour: item.hour,

          label: `${String(
            item.hour,
          ).padStart(2, "0")}h`,

          sessions:
            item.sessions,

          visitors:
            item.visitors.size,
        }));

      /*
       * Encontra o horário com
       * maior quantidade de sessões.
       */
      const peak =
        data.reduce(
          (highest, current) =>
            current.sessions >
            highest.sessions
              ? current
              : highest,
          data[0],
        );

      return res.json({
        period,

        periodStart:
          periodStart ?? null,

        totalSessions:
          sessions.length,

        peakHour:
          peak.sessions > 0
            ? {
                hour: peak.hour,
                label: peak.label,
                sessions:
                  peak.sessions,
                visitors:
                  peak.visitors,
              }
            : null,

        hours: data,
      });
    } catch (error) {
      console.error(
        "Failed to fetch hourly analytics:",
        error,
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to fetch hourly analytics",
        });
    }
  },
);

export default router;