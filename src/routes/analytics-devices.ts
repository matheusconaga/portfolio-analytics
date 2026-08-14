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

interface AggregateData {
  sessions: number;
  visitors: Set<string>;
}

function detectDevice(
  userAgent: string | null,
): string {
  if (!userAgent) {
    return "Desconhecido";
  }

  const ua = userAgent.toLowerCase();

  if (
    ua.includes("ipad") ||
    ua.includes("tablet") ||
    (
      ua.includes("android") &&
      !ua.includes("mobile")
    )
  ) {
    return "Tablet";
  }

  if (
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    ua.includes("android") ||
    ua.includes("mobile")
  ) {
    return "Mobile";
  }

  return "Desktop";
}

function detectBrowser(
  userAgent: string | null,
): string {
  if (!userAgent) {
    return "Desconhecido";
  }

  const ua = userAgent.toLowerCase();

  /*
   * Edge precisa ser verificado
   * antes do Chrome porque também
   * possui "chrome" no user agent.
   */
  if (
    ua.includes("edg/")
  ) {
    return "Edge";
  }

  /*
   * Opera também costuma conter
   * informações do Chromium.
   */
  if (
    ua.includes("opr/") ||
    ua.includes("opera")
  ) {
    return "Opera";
  }

  /*
   * Samsung Internet.
   */
  if (
    ua.includes(
      "samsungbrowser",
    )
  ) {
    return "Samsung Internet";
  }

  /*
   * Firefox.
   */
  if (
    ua.includes("firefox/") ||
    ua.includes("fxios/")
  ) {
    return "Firefox";
  }

  /*
   * Chrome / Chrome iOS.
   */
  if (
    ua.includes("chrome/") ||
    ua.includes("crios/")
  ) {
    return "Chrome";
  }

  /*
   * Safari só é considerado depois
   * de Chrome/Edge/Opera porque
   * alguns navegadores Chromium
   * também possuem "Safari"
   * no user agent.
   */
  if (
    ua.includes("safari/") &&
    !ua.includes("chrome/") &&
    !ua.includes("crios/") &&
    !ua.includes("android")
  ) {
    return "Safari";
  }

  return "Outros";
}

function aggregate(
  map: Map<string, AggregateData>,
  key: string,
  visitorId: string,
) {
  let item = map.get(key);

  if (!item) {
    item = {
      sessions: 0,
      visitors: new Set<string>(),
    };

    map.set(
      key,
      item,
    );
  }

  item.sessions += 1;

  item.visitors.add(
    visitorId,
  );
}

function formatAggregate(
  map: Map<string, AggregateData>,
  totalSessions: number,
) {
  return Array.from(
    map.entries(),
  )
    .map(
      ([
        name,
        data,
      ]) => ({
        name,

        sessions:
          data.sessions,

        visitors:
          data.visitors.size,

        percentage:
          totalSessions === 0
            ? 0
            : Number(
                (
                  (data.sessions /
                    totalSessions) *
                  100
                ).toFixed(2),
              ),
      }),
    )
    .sort(
      (a, b) =>
        b.sessions -
        a.sessions,
    );
}

router.get(
  "/devices",
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
            visitorId: true,
            userAgent: true,
          },
        });

      const deviceMap =
        new Map<
          string,
          AggregateData
        >();

      const browserMap =
        new Map<
          string,
          AggregateData
        >();

      for (
        const session of sessions
      ) {
        const device =
          detectDevice(
            session.userAgent,
          );

        const browser =
          detectBrowser(
            session.userAgent,
          );

        aggregate(
          deviceMap,
          device,
          session.visitorId,
        );

        aggregate(
          browserMap,
          browser,
          session.visitorId,
        );
      }

      const totalSessions =
        sessions.length;

      return res.json({
        period,

        periodStart:
          periodStart ?? null,

        totalSessions,

        devices:
          formatAggregate(
            deviceMap,
            totalSessions,
          ),

        browsers:
          formatAggregate(
            browserMap,
            totalSessions,
          ),
      });
    } catch (error) {
      console.error(
        "Failed to fetch device analytics:",
        error,
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to fetch device analytics",
        });
    }
  },
);

export default router;