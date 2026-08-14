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

interface DurationBucket {
  key: string;
  label: string;
  sessions: number;
}

function formatDuration(
  seconds: number,
): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  const remainingSeconds =
    seconds % 60;

  if (minutes < 60) {
    if (
      remainingSeconds === 0
    ) {
      return `${minutes}min`;
    }

    return `${minutes}min ${remainingSeconds}s`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  return `${hours}h ${remainingMinutes}min`;
}

router.get(
  "/engagement",
  requireAuth,
  async (req, res) => {
    try {
      const period =
        (req.query
          .period as AnalyticsPeriod) ||
        "7d";

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
          error:
            "Invalid period",
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
            id: true,
            startedAt: true,
            lastActivityAt: true,
          },
        });

      /*
       * Calcula a duração aproximada
       * de cada sessão.
       *
       * Limitamos a 30 minutos para
       * evitar sessões antigas ou abas
       * esquecidas abertas distorcendo
       * excessivamente a média.
       */
      const durations =
        sessions.map(
          (session) => {
            const milliseconds =
              session.lastActivityAt.getTime() -
              session.startedAt.getTime();

            const seconds =
              Math.max(
                0,
                Math.floor(
                  milliseconds /
                    1000,
                ),
              );

            return Math.min(
              seconds,
              30 * 60,
            );
          },
        );

      const totalSessions =
        durations.length;

      const totalDuration =
        durations.reduce(
          (
            total,
            duration,
          ) =>
            total +
            duration,
          0,
        );

      const averageDuration =
        totalSessions === 0
          ? 0
          : Math.round(
              totalDuration /
                totalSessions,
            );

      const longestDuration =
        durations.length === 0
          ? 0
          : Math.max(
              ...durations,
            );

      /*
       * Consideramos uma sessão
       * engajada quando ela permanece
       * por pelo menos 30 segundos.
       */
      const engagedSessions =
        durations.filter(
          (duration) =>
            duration >= 30,
        ).length;

      const quickSessions =
        durations.filter(
          (duration) =>
            duration < 30,
        ).length;

      const engagementRate =
        totalSessions === 0
          ? 0
          : Number(
              (
                (engagedSessions /
                  totalSessions) *
                100
              ).toFixed(2),
            );

      const buckets: DurationBucket[] =
        [
          {
            key: "under_30s",
            label: "< 30s",
            sessions: 0,
          },
          {
            key: "30s_1m",
            label: "30s – 1min",
            sessions: 0,
          },
          {
            key: "1m_3m",
            label: "1 – 3min",
            sessions: 0,
          },
          {
            key: "3m_10m",
            label: "3 – 10min",
            sessions: 0,
          },
          {
            key: "10m_plus",
            label: "10min+",
            sessions: 0,
          },
        ];

      for (
        const duration of durations
      ) {
        if (
          duration < 30
        ) {
          buckets[0].sessions += 1;
        } else if (
          duration < 60
        ) {
          buckets[1].sessions += 1;
        } else if (
          duration < 180
        ) {
          buckets[2].sessions += 1;
        } else if (
          duration < 600
        ) {
          buckets[3].sessions += 1;
        } else {
          buckets[4].sessions += 1;
        }
      }

      const distribution =
        buckets.map(
          (bucket) => ({
            ...bucket,

            percentage:
              totalSessions === 0
                ? 0
                : Number(
                    (
                      (bucket.sessions /
                        totalSessions) *
                      100
                    ).toFixed(2),
                  ),
          }),
        );

      return res.json({
        period,

        periodStart:
          periodStart ?? null,

        totalSessions,

        averageDurationSeconds:
          averageDuration,

        averageDuration:
          formatDuration(
            averageDuration,
          ),

        longestDurationSeconds:
          longestDuration,

        longestDuration:
          formatDuration(
            longestDuration,
          ),

        engagedSessions,

        quickSessions,

        engagementRate,

        distribution,
      });
    } catch (error) {
      console.error(
        "Failed to fetch engagement analytics:",
        error,
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to fetch engagement analytics",
        });
    }
  },
);

export default router;