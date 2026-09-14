import {
  Activity,
  BarChart3,
  Code2,
  Database,
  ExternalLink,
  FileDown,
  GitFork,
  Languages,
  Mail,
  MessageCircle,
  MonitorPlay,
  MousePointerClick,
  RefreshCw,
  Server,
  Users,
  Workflow,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getPublicProjects,
  getPublicStats,
  getPublicTimeline,
  type PublicProjectsResponse,
  type PublicStats,
  type PublicTimelineResponse,
} from "./api";

import TimelineChart from "./components/TimelineChart";
import ProjectsTable from "./components/ProjectsTable";
import ProjectFooter from "./components/footer";

import { useAppTranslation } from "./shared/hooks/useAppTranslation";

/* =====================================================
   METRIC CARD
===================================================== */

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  locale: "pt" | "en";
}

function MetricCard({
  title,
  value,
  description,
  icon,
  locale,
}: MetricCardProps) {
  const numberLocale =
    locale === "pt"
      ? "pt-BR"
      : "en-US";

  return (
    <article
      className="
        flex
        min-h-[132px]
        flex-col
        justify-between

        rounded-xl

        border
        border-white/10

        bg-white/[0.025]

        p-4
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-400 sm:text-sm">
            {title}
          </p>

          <p
            className="
              mt-2

              text-2xl
              font-semibold
              tracking-tight
              text-white

              sm:text-3xl
            "
          >
            {typeof value === "number"
              ? value.toLocaleString(
                  numberLocale,
                )
              : value}
          </p>
        </div>

        <div
          className="
            flex
            h-9
            w-9
            shrink-0

            items-center
            justify-center

            rounded-lg

            border
            border-white/10

            bg-white/[0.04]

            text-zinc-300
          "
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-zinc-500 sm:text-xs">
        {description}
      </p>
    </article>
  );
}

/* =====================================================
   SECTION HEADER
===================================================== */

interface SectionHeaderProps {
  title: string;
  description: string;
}

function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 sm:mb-5">
      <h2 className="text-base font-semibold text-white sm:text-lg">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function DashboardLoading() {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-[132px]

              rounded-xl

              border
              border-white/10

              bg-white/[0.025]
            "
          />
        ))}
      </div>

      <div
        className="
          mt-8
          h-[360px]

          rounded-xl

          border
          border-white/10

          bg-white/[0.025]
        "
      />
    </section>
  );
}

/* =====================================================
   APP
===================================================== */

function App() {
  const {
    t,
    language,
    changeLanguage,
  } = useAppTranslation();

  const [stats, setStats] =
    useState<PublicStats | null>(
      null,
    );

  const [timeline, setTimeline] =
    useState<PublicTimelineResponse | null>(
      null,
    );

  const [projects, setProjects] =
    useState<PublicProjectsResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  /* =====================================================
     LOAD
  ===================================================== */

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(false);

        const [
          statsData,
          timelineData,
          projectsData,
        ] = await Promise.all([
          getPublicStats("7d"),
          getPublicTimeline("7d"),
          getPublicProjects("7d"),
        ]);

        setStats(statsData);
        setTimeline(
          timelineData,
        );
        setProjects(
          projectsData,
        );
      } catch (error) {
        console.error(error);

        setError(true);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();

    const interval =
      window.setInterval(() => {
        void loadDashboard();
      }, 60_000);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [loadDashboard]);

  /* =====================================================
     DERIVED METRICS
  ===================================================== */

  const insights =
    useMemo(() => {
      if (!stats) {
        return null;
      }

      const visitors =
        stats.overview.visitors;

      const sessions =
        stats.overview.sessions;

      const directContacts =
        stats.interactions
          .whatsappClicks +
        stats.interactions
          .emailClicks;

      const sessionsPerVisitor =
        visitors > 0
          ? sessions /
            visitors
          : 0;

      const demoInterest =
        visitors > 0
          ? (stats
              .interactions
              .demoClicks /
              visitors) *
            100
          : 0;

      const contactRate =
        visitors > 0
          ? (directContacts /
              visitors) *
            100
          : 0;

      const resumeRate =
        visitors > 0
          ? (stats
              .interactions
              .resumeDownloads /
              visitors) *
            100
          : 0;

      return {
        sessionsPerVisitor,
        demoInterest,
        contactRate,
        resumeRate,
      };
    }, [stats]);

  const interactionItems =
    stats
      ? [
          {
            label: t(
              "interactions.demo",
            ),
            value:
              stats.interactions
                .demoClicks,
            icon: MonitorPlay,
          },
          {
            label: t(
              "interactions.resume",
            ),
            value:
              stats.interactions
                .resumeDownloads,
            icon: FileDown,
          },
          {
            label: t(
              "interactions.whatsapp",
            ),
            value:
              stats.interactions
                .whatsappClicks,
            icon: MessageCircle,
          },
          {
            label: t(
              "interactions.email",
            ),
            value:
              stats.interactions
                .emailClicks,
            icon: Mail,
          },
          {
            label: t(
              "interactions.github",
            ),
            value:
              stats.interactions
                .githubClicks,
            icon: GitFork,
          },
          {
            label: t(
              "interactions.linkedin",
            ),
            value:
              stats.interactions
                .linkedinClicks,
            icon: ExternalLink,
          },
        ]
      : [];

  const maxInteraction =
    Math.max(
      ...interactionItems.map(
        (item) =>
          item.value,
      ),
      1,
    );

  const architectureItems = [
    {
      icon: Code2,
      title: t(
        "architecture.frontend",
      ),
      value:
        "React + TypeScript",
    },
    {
      icon: Server,
      title: t(
        "architecture.api",
      ),
      value:
        "Node.js + Express",
    },
    {
      icon: Database,
      title: t(
        "architecture.persistence",
      ),
      value:
        "Prisma + PostgreSQL",
    },
    {
      icon: Workflow,
      title: t(
        "architecture.automation",
      ),
      value: "n8n",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <div
        className="
          mx-auto
          w-full
          max-w-7xl

          px-4
          py-6

          sm:px-6
          sm:py-8

          md:px-8

          lg:px-10
          lg:py-10
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="border-b border-white/10 pb-8 lg:pb-10">
          {/* LANGUAGE */}
          <div
            className="
              mb-5
              flex
              justify-end
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-1

                rounded-lg

                border
                border-white/10

                bg-white/[0.025]

                p-1
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7

                  items-center
                  justify-center

                  text-zinc-500
                "
              >
                <Languages
                  size={15}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  void changeLanguage(
                    "pt",
                  );
                }}
                className={`
                  min-w-10

                  rounded-md

                  px-2.5
                  py-1.5

                  text-[11px]
                  font-semibold

                  transition-colors

                  ${
                    language ===
                    "pt"
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                PT
              </button>

              <button
                type="button"
                onClick={() => {
                  void changeLanguage(
                    "en",
                  );
                }}
                className={`
                  min-w-10

                  rounded-md

                  px-2.5
                  py-1.5

                  text-[11px]
                  font-semibold

                  transition-colors

                  ${
                    language ===
                    "en"
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                EN
              </button>
            </div>
          </div>

          <div
            className="
              flex
              flex-col
              gap-6

              lg:flex-row
              lg:items-end
              lg:justify-between
              lg:gap-12
            "
          >
            <div className="min-w-0">
              <div
                className="
                  mb-4
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-white/10

                    bg-white/[0.03]

                    px-3
                    py-1.5

                    text-[11px]
                    font-medium
                    text-zinc-400
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  {t(
                    "header.liveApi",
                  )}
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-white/10

                    px-3
                    py-1.5

                    text-[11px]
                    text-zinc-500
                  "
                >
                  {t(
                    "header.period",
                  )}
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-white/10

                    px-3
                    py-1.5

                    text-[11px]
                    text-zinc-500
                  "
                >
                  {t(
                    "header.anonymous",
                  )}
                </span>
              </div>

              <h1
                className="
                  max-w-4xl

                  text-3xl
                  font-semibold
                  tracking-[-0.03em]

                  sm:text-4xl
                  md:text-5xl
                "
              >
                {t(
                  "header.title",
                )}
              </h1>

              <p
                className="
                  mt-4
                  max-w-2xl

                  text-sm
                  leading-6
                  text-zinc-400

                  sm:text-base
                  sm:leading-7
                "
              >
                {t(
                  "header.description",
                )}
              </p>
            </div>

            <div
              className="
                flex
                w-full
                flex-col
                gap-2

                sm:w-auto
                sm:flex-row
              "
            >
              <a
                href="https://github.com/matheusconaga/portfolio-analytics"
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2

                  rounded-lg

                  border
                  border-white/10

                  px-4
                  py-2.5

                  text-sm
                  text-zinc-300

                  transition-colors

                  hover:bg-white/5
                  hover:text-white
                "
              >
                <Code2
                  size={16}
                />

                {t(
                  "header.code",
                )}

                <ExternalLink
                  size={13}
                />
              </a>

              <a
                href="https://matheusconaga.dev"
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2

                  rounded-lg

                  bg-white

                  px-4
                  py-2.5

                  text-sm
                  font-medium
                  text-black

                  transition-colors

                  hover:bg-zinc-200
                "
              >
                {t(
                  "header.portfolio",
                )}

                <ExternalLink
                  size={13}
                />
              </a>
            </div>
          </div>
        </header>

        {/* =================================================
            PRODUCT CONTEXT
        ================================================= */}

        <section className="mt-6">
          <div
            className="
              grid

              rounded-xl

              border
              border-white/10

              bg-white/[0.02]

              sm:grid-cols-3
            "
          >
            <div className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                {t(
                  "context.source.title",
                )}
              </p>

              <p className="mt-1.5 text-sm text-zinc-300">
                {t(
                  "context.source.value",
                )}
              </p>
            </div>

            <div className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                {t(
                  "context.update.title",
                )}
              </p>

              <p className="mt-1.5 text-sm text-zinc-300">
                {t(
                  "context.update.value",
                )}
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                {t(
                  "context.period.title",
                )}
              </p>

              <p className="mt-1.5 text-sm text-zinc-300">
                {t(
                  "context.period.value",
                )}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <DashboardLoading />
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading &&
          error && (
            <section
              className="
                mt-8

                flex
                min-h-[280px]

                items-center
                justify-center

                rounded-xl

                border
                border-red-500/20

                bg-red-500/[0.04]

                p-6
                text-center
              "
            >
              <div className="flex max-w-sm flex-col items-center">
                <Activity
                  size={24}
                  className="text-red-400"
                />

                <h2 className="mt-4 font-medium text-white">
                  {t(
                    "error.title",
                  )}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {t(
                    "error.description",
                  )}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    void loadDashboard();
                  }}
                  className="
                    mt-5

                    inline-flex
                    min-h-10

                    items-center
                    justify-center
                    gap-2

                    rounded-lg

                    border
                    border-white/10

                    px-4
                    py-2

                    text-sm
                    text-zinc-300

                    transition-colors

                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  <RefreshCw
                    size={15}
                  />

                  {t(
                    "error.retry",
                  )}
                </button>
              </div>
            </section>
          )}

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {!loading &&
          !error &&
          stats && (
            <>
              {/* KPI */}

              <section className="mt-8">
                <SectionHeader
                  title={t(
                    "overview.title",
                  )}
                  description={t(
                    "overview.description",
                  )}
                />

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3

                    lg:grid-cols-4
                  "
                >
                  <MetricCard
                    title={t(
                      "overview.visitors.title",
                    )}
                    value={
                      stats.overview
                        .visitors
                    }
                    description={t(
                      "overview.visitors.description",
                    )}
                    icon={
                      <Users
                        size={17}
                      />
                    }
                    locale={
                      language
                    }
                  />

                  <MetricCard
                    title={t(
                      "overview.sessions.title",
                    )}
                    value={
                      stats.overview
                        .sessions
                    }
                    description={t(
                      "overview.sessions.description",
                    )}
                    icon={
                      <BarChart3
                        size={17}
                      />
                    }
                    locale={
                      language
                    }
                  />

                  <MetricCard
                    title={t(
                      "overview.interactions.title",
                    )}
                    value={
                      stats.interactions
                        .total
                    }
                    description={t(
                      "overview.interactions.description",
                    )}
                    icon={
                      <MousePointerClick
                        size={17}
                      />
                    }
                    locale={
                      language
                    }
                  />

                  <MetricCard
                    title={t(
                      "overview.resume.title",
                    )}
                    value={
                      stats.interactions
                        .resumeDownloads
                    }
                    description={t(
                      "overview.resume.description",
                    )}
                    icon={
                      <FileDown
                        size={17}
                      />
                    }
                    locale={
                      language
                    }
                  />
                </div>
              </section>

              {/* PRODUCT SIGNALS */}

              {insights && (
                <section className="mt-8 sm:mt-10">
                  <SectionHeader
                    title={t(
                      "engagement.title",
                    )}
                    description={t(
                      "engagement.description",
                    )}
                  />

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3

                      lg:grid-cols-4
                    "
                  >
                    <MetricCard
                      title={t(
                        "engagement.sessionsPerVisitor",
                      )}
                      value={insights.sessionsPerVisitor.toFixed(
                        1,
                      )}
                      description={t(
                        "engagement.sessionsPerVisitor.description",
                      )}
                      icon={
                        <Users
                          size={17}
                        />
                      }
                      locale={
                        language
                      }
                    />

                    <MetricCard
                      title={t(
                        "engagement.demoInterest",
                      )}
                      value={`${insights.demoInterest.toFixed(
                        1,
                      )}%`}
                      description={t(
                        "engagement.demoInterest.description",
                      )}
                      icon={
                        <MonitorPlay
                          size={17}
                        />
                      }
                      locale={
                        language
                      }
                    />

                    <MetricCard
                      title={t(
                        "engagement.contactRate",
                      )}
                      value={`${insights.contactRate.toFixed(
                        1,
                      )}%`}
                      description={t(
                        "engagement.contactRate.description",
                      )}
                      icon={
                        <MessageCircle
                          size={17}
                        />
                      }
                      locale={
                        language
                      }
                    />

                    <MetricCard
                      title={t(
                        "engagement.resumeRate",
                      )}
                      value={`${insights.resumeRate.toFixed(
                        1,
                      )}%`}
                      description={t(
                        "engagement.resumeRate.description",
                      )}
                      icon={
                        <FileDown
                          size={17}
                        />
                      }
                      locale={
                        language
                      }
                    />
                  </div>
                </section>
              )}

              {/* TIMELINE */}

              {timeline && (
                <section className="mt-8 sm:mt-10 lg:mt-12">
                  <SectionHeader
                    title={t(
                      "timeline.section.title",
                    )}
                    description={t(
                      "timeline.section.description",
                    )}
                  />

                  <TimelineChart
                    data={
                      timeline.data
                    }
                  />
                </section>
              )}

              {/* PROJECTS */}

              {projects && (
                <section className="mt-8 sm:mt-10 lg:mt-12">
                  <SectionHeader
                    title={t(
                      "projects.section.title",
                    )}
                    description={t(
                      "projects.section.description",
                    )}
                  />

                  <ProjectsTable
                    projects={
                      projects.projects
                    }
                  />
                </section>
              )}

              {/* INTERACTIONS */}

              <section className="mt-8 sm:mt-10 lg:mt-12">
                <SectionHeader
                  title={t(
                    "interactions.title",
                  )}
                  description={t(
                    "interactions.description",
                  )}
                />

                <div
                  className="
                    overflow-hidden

                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.025]
                  "
                >
                  {interactionItems.map(
                    ({
                      label,
                      value,
                      icon: Icon,
                    }) => {
                      const percentage =
                        (value /
                          maxInteraction) *
                        100;

                      return (
                        <div
                          key={
                            label
                          }
                          className="
                            grid
                            grid-cols-[1fr_auto]

                            gap-4

                            border-b
                            border-white/[0.06]

                            px-4
                            py-4

                            last:border-b-0

                            sm:grid-cols-[180px_1fr_50px]
                            sm:items-center
                            sm:px-5
                          "
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              size={
                                15
                              }
                              className="text-zinc-500"
                            />

                            <span className="text-sm text-zinc-300">
                              {
                                label
                              }
                            </span>
                          </div>

                          <div
                            className="
                              hidden
                              h-1.5
                              overflow-hidden
                              rounded-full
                              bg-white/[0.06]

                              sm:block
                            "
                          >
                            <div
                              className="h-full rounded-full bg-[#37CBFB]"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="text-right text-sm font-medium text-white">
                            {
                              value
                            }
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </section>

              {/* ARCHITECTURE */}

              <section className="mt-8 sm:mt-10 lg:mt-12">
                <SectionHeader
                  title={t(
                    "architecture.title",
                  )}
                  description={t(
                    "architecture.description",
                  )}
                />

                <div
                  className="
                    grid
                    grid-cols-1

                    overflow-hidden

                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.02]

                    sm:grid-cols-2
                    lg:grid-cols-4
                  "
                >
                  {architectureItems.map(
                    ({
                      icon: Icon,
                      title,
                      value,
                    }) => (
                      <div
                        key={
                          title
                        }
                        className="
                          border-b
                          border-white/10

                          p-5

                          sm:border-r

                          lg:border-b-0

                          last:border-0
                        "
                      >
                        <Icon
                          size={17}
                          className="text-zinc-500"
                        />

                        <p className="mt-4 text-xs text-zinc-500">
                          {
                            title
                          }
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {
                            value
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>

              {/* DASHBOARD FOOTER */}

              <footer
                className="
                  mt-10

                  flex
                  flex-col
                  gap-3

                  border-t
                  border-white/10

                  pt-6

                  text-xs
                  text-zinc-600

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span>
                  {t(
                    "footer.telemetry",
                  )}
                </span>

                <span>
                  {t(
                    "footer.data",
                  )}
                </span>
              </footer>
            </>
          )}
      </div>

      <ProjectFooter
        projectName="Portfolio Analytics"
        locale={language}
      />
    </main>
  );
}

export default App;