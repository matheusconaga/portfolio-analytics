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

interface SourceData {
  source: string;
  sessions: number;
  visitors: Set<string>;
}

interface TrafficSource {
  source: string;
  sessions: number;
  visitors: number;
  percentage: number;
}

/*
 * Quantidade máxima de origens
 * exibidas individualmente.
 *
 * As demais serão agrupadas
 * em "Outros".
 */
const MAIN_SOURCES_LIMIT = 5;

/*
 * Converte o referrer recebido
 * em um nome mais amigável.
 */
function getTrafficSource(
  referrer: string | null,
): string {
  if (
    !referrer ||
    !referrer.trim()
  ) {
    return "Direto";
  }

  try {
    const url = new URL(
      referrer,
    );

    const hostname =
      url.hostname
        .replace(
          /^www\./,
          "",
        )
        .toLowerCase();

    /*
     * Ambiente de desenvolvimento
     */
    if (
      hostname ===
        "localhost" ||
      hostname ===
        "127.0.0.1"
    ) {
      return "Desenvolvimento";
    }

    /*
     * Buscadores
     */
    if (
      hostname.includes(
        "google.",
      )
    ) {
      return "Google";
    }

    if (
      hostname.includes(
        "bing.com",
      )
    ) {
      return "Bing";
    }

    /*
     * Redes sociais
     */
    if (
      hostname.includes(
        "linkedin.com",
      )
    ) {
      return "LinkedIn";
    }

    if (
      hostname.includes(
        "instagram.com",
      )
    ) {
      return "Instagram";
    }

    if (
      hostname.includes(
        "facebook.com",
      ) ||
      hostname.includes(
        "fb.com",
      )
    ) {
      return "Facebook";
    }

    if (
      hostname.includes(
        "twitter.com",
      ) ||
      hostname ===
        "x.com" ||
      hostname.endsWith(
        ".x.com",
      ) ||
      hostname.includes(
        "t.co",
      )
    ) {
      return "X / Twitter";
    }

    if (
      hostname.includes(
        "youtube.com",
      ) ||
      hostname.includes(
        "youtu.be",
      )
    ) {
      return "YouTube";
    }

    /*
     * Desenvolvimento
     */
    if (
      hostname.includes(
        "github.com",
      )
    ) {
      return "GitHub";
    }

    /*
     * Caso não seja uma origem
     * conhecida, usamos o domínio.
     *
     * Exemplo:
     * medium.com
     * dev.to
     * portfolioempresa.com
     */
    return hostname;
  } catch {
    return "Outros";
  }
}

router.get(
  "/referrers",
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

      /*
       * Validação do período
       */
      if (
        !validPeriods.includes(
          period,
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid period",

            validPeriods,
          });
      }

      const periodStart =
        getPeriodStart(
          period,
        );

      /*
       * Busca as sessões
       * pertencentes ao período.
       */
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
            referrer: true,
          },
        });

      /*
       * Agrupa sessões e visitantes
       * por origem.
       */
      const sources =
        new Map<
          string,
          SourceData
        >();

      for (
        const session of sessions
      ) {
        const source =
          getTrafficSource(
            session.referrer,
          );

        let sourceData =
          sources.get(
            source,
          );

        if (!sourceData) {
          sourceData = {
            source,

            sessions: 0,

            visitors:
              new Set<string>(),
          };

          sources.set(
            source,
            sourceData,
          );
        }

        sourceData.sessions +=
          1;

        sourceData.visitors.add(
          session.visitorId,
        );
      }

      const totalSessions =
        sessions.length;

      /*
       * Transforma o Map em array,
       * calcula as porcentagens e
       * ordena da maior origem
       * para a menor.
       */
      const sortedSources: TrafficSource[] =
        Array.from(
          sources.values(),
        )
          .map(
            (item) => ({
              source:
                item.source,

              sessions:
                item.sessions,

              visitors:
                item.visitors
                  .size,

              percentage:
                totalSessions ===
                0
                  ? 0
                  : Number(
                      (
                        (item.sessions /
                          totalSessions) *
                        100
                      ).toFixed(
                        2,
                      ),
                    ),
            }),
          )
          .sort(
            (a, b) =>
              b.sessions -
              a.sessions,
          );

      /*
       * Mantém apenas as principais
       * origens individualmente.
       */
      const mainSources =
        sortedSources.slice(
          0,
          MAIN_SOURCES_LIMIT,
        );

      /*
       * Origens que serão agrupadas
       * em "Outros".
       */
      const remainingSources =
        sortedSources.slice(
          MAIN_SOURCES_LIMIT,
        );

      /*
       * Se existirem origens além
       * das principais, agrupamos
       * todas em "Outros".
       */
      if (
        remainingSources.length >
        0
      ) {
        const otherSessions =
          remainingSources.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.sessions,
            0,
          );

        /*
         * Nomes das origens que
         * pertencem ao grupo
         * "Outros".
         */
        const otherSourceNames =
          new Set(
            remainingSources.map(
              (item) =>
                item.source,
            ),
          );

        /*
         * Visitantes únicos dentro
         * de todas as origens
         * agrupadas.
         *
         * Usamos Set para evitar
         * contar a mesma pessoa
         * mais de uma vez.
         */
        const otherVisitors =
          new Set<string>();

        for (
          const session of sessions
        ) {
          const source =
            getTrafficSource(
              session.referrer,
            );

          if (
            otherSourceNames.has(
              source,
            )
          ) {
            otherVisitors.add(
              session.visitorId,
            );
          }
        }

        mainSources.push({
          source:
            "Outros",

          sessions:
            otherSessions,

          visitors:
            otherVisitors.size,

          percentage:
            totalSessions ===
            0
              ? 0
              : Number(
                  (
                    (otherSessions /
                      totalSessions) *
                    100
                  ).toFixed(
                    2,
                  ),
                ),
        });
      }

      /*
       * Reordena novamente porque
       * "Outros" pode acabar tendo
       * mais sessões do que alguma
       * das origens principais.
       */
      const data =
        mainSources.sort(
          (a, b) =>
            b.sessions -
            a.sessions,
        );

      return res.json({
        period,

        periodStart:
          periodStart ??
          null,

        totalSessions,

        sources:
          data,
      });
    } catch (error) {
      console.error(
        "Failed to fetch traffic sources:",
        error,
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to fetch traffic sources",
        });
    }
  },
);

export default router;