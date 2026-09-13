import {
  Activity,
  BarChart3,
  Code2,
  Database,
  ExternalLink,
  FileDown,
  GitFork,
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

/* =====================================================
   METRIC CARD
===================================================== */

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: MetricCardProps) {
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
              ? value.toLocaleString("pt-BR")
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
  const [
    stats,
    setStats,
  ] = useState<PublicStats | null>(
    null,
  );

  const [
    timeline,
    setTimeline,
  ] =
    useState<PublicTimelineResponse | null>(
      null,
    );

  const [
    projects,
    setProjects,
  ] =
    useState<PublicProjectsResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     LOAD
  ===================================================== */

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

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
        setTimeline(timelineData);
        setProjects(projectsData);
      } catch (error) {
        console.error(error);

        setError(
          "Não foi possível carregar os dados públicos do Analytics.",
        );
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
          ? sessions / visitors
          : 0;

      const demoInterest =
        visitors > 0
          ? (
              (stats.interactions
                .demoClicks /
                visitors) *
              100
            )
          : 0;

      const contactRate =
        visitors > 0
          ? (
              (directContacts /
                visitors) *
              100
            )
          : 0;

      const resumeRate =
        visitors > 0
          ? (
              (stats.interactions
                .resumeDownloads /
                visitors) *
              100
            )
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
            label: "Demos",
            value:
              stats.interactions
                .demoClicks,
            icon: MonitorPlay,
          },
          {
            label: "Currículo",
            value:
              stats.interactions
                .resumeDownloads,
            icon: FileDown,
          },
          {
            label: "WhatsApp",
            value:
              stats.interactions
                .whatsappClicks,
            icon: MessageCircle,
          },
          {
            label: "Email",
            value:
              stats.interactions
                .emailClicks,
            icon: Mail,
          },
          {
            label: "GitHub",
            value:
              stats.interactions
                .githubClicks,
            icon: GitFork,
          },
          {
            label: "LinkedIn",
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
        (item) => item.value,
      ),
      1,
    );

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

                  Live API
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
                  Janela móvel · 7 dias
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
                  Dados anonimizados
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
                Portfolio Analytics
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
                Plataforma first-party
                desenvolvida para coletar,
                processar e visualizar
                comportamento e conversões
                reais do meu portfólio.
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
                <Code2 size={16} />

                Código

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
                Ver portfólio

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
                Origem
              </p>

              <p className="mt-1.5 text-sm text-zinc-300">
                First-party analytics
              </p>
            </div>

            <div className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                Atualização
              </p>

              <p className="mt-1.5 text-sm text-zinc-300">
                API pública · 60 segundos
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                Período
              </p>

              <p className="mt-1.5 text-sm text-zinc-300">
                Últimos 7 dias
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
                  Analytics indisponível
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    loadDashboard
                  }
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

                  Tentar novamente
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
                  title="Visão geral"
                  description="Indicadores principais registrados no período atual."
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
                    title="Visitantes"
                    value={
                      stats.overview
                        .visitors
                    }
                    description="Visitantes únicos registrados"
                    icon={
                      <Users
                        size={17}
                      />
                    }
                  />

                  <MetricCard
                    title="Sessões"
                    value={
                      stats.overview
                        .sessions
                    }
                    description="Sessões iniciadas no período"
                    icon={
                      <BarChart3
                        size={17}
                      />
                    }
                  />

                  <MetricCard
                    title="Interações"
                    value={
                      stats
                        .interactions
                        .total
                    }
                    description="Ações relevantes no portfólio"
                    icon={
                      <MousePointerClick
                        size={17}
                      />
                    }
                  />

                  <MetricCard
                    title="Currículos"
                    value={
                      stats
                        .interactions
                        .resumeDownloads
                    }
                    description="Downloads do currículo"
                    icon={
                      <FileDown
                        size={17}
                      />
                    }
                  />
                </div>
              </section>

              {/* PRODUCT SIGNALS */}

              {insights && (
                <section className="mt-8 sm:mt-10">
                  <SectionHeader
                    title="Indicadores de engajamento"
                    description="Métricas calculadas a partir do comportamento registrado."
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
                      title="Sessões / visitante"
                      value={
                        insights.sessionsPerVisitor.toFixed(
                          1,
                        )
                      }
                      description="Recorrência média por visitante"
                      icon={
                        <Users
                          size={17}
                        />
                      }
                    />

                    <MetricCard
                      title="Interesse em demos"
                      value={`${insights.demoInterest.toFixed(
                        1,
                      )}%`}
                      description="Cliques em demos por visitante"
                      icon={
                        <MonitorPlay
                          size={17}
                        />
                      }
                    />

                    <MetricCard
                      title="Contato direto"
                      value={`${insights.contactRate.toFixed(
                        1,
                      )}%`}
                      description="Email ou WhatsApp por visitante"
                      icon={
                        <MessageCircle
                          size={17}
                        />
                      }
                    />

                    <MetricCard
                      title="Currículo"
                      value={`${insights.resumeRate.toFixed(
                        1,
                      )}%`}
                      description="Downloads por visitante"
                      icon={
                        <FileDown
                          size={17}
                        />
                      }
                    />
                  </div>
                </section>
              )}

              {/* TIMELINE */}

              {timeline && (
                <section className="mt-8 sm:mt-10 lg:mt-12">
                  <SectionHeader
                    title="Tráfego ao longo do tempo"
                    description="Evolução diária de visitantes, sessões e visualizações."
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
                    title="Engajamento por projeto"
                    description="Projetos que receberam visualizações e ações de saída."
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
                  title="Ações dos visitantes"
                  description="Distribuição dos eventos de maior intenção registrados no portfólio."
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
                            {value}
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
                  title="Arquitetura"
                  description="Principais componentes utilizados na construção do Analytics."
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
                  {[
                    {
                      icon: Code2,
                      title:
                        "Frontend",
                      value:
                        "React + TypeScript",
                    },
                    {
                      icon: Server,
                      title: "API",
                      value:
                        "Node.js + Express",
                    },
                    {
                      icon: Database,
                      title:
                        "Persistência",
                      value:
                        "Prisma + PostgreSQL",
                    },
                    {
                      icon: Workflow,
                      title:
                        "Automação",
                      value: "n8n",
                    },
                  ].map(
                    ({
                      icon: Icon,
                      title,
                      value,
                    }) => (
                      <div
                        key={title}
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
                          {title}
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {value}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>

              {/* FOOTER */}

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
                  Portfolio Analytics ·
                  Telemetria first-party
                </span>

                <span>
                  Dados públicos e anonimizados
                </span>
              </footer>
            </>
          )}
      </div>
    </main>
  );
}

export default App;