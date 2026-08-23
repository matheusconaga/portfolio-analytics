import {
  Activity,
  BarChart3,
  ExternalLink,
  Eye,
  FileDown,
  GitFork,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getPublicProjects,
  getPublicStats,
  getPublicTimeline,
  initializeServices,
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
  value: number;
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
        min-h-[138px]
        flex-col
        justify-between
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-4
        transition
        duration-300

        hover:border-white/20
        hover:bg-white/[0.05]

        sm:min-h-[150px]
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-zinc-400 sm:text-sm">
            {title}
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-semibold
              tracking-tight
              text-white

              sm:mt-3
              sm:text-3xl
            "
          >
            {value.toLocaleString(
              "pt-BR",
            )}
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
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-zinc-300

            sm:h-10
            sm:w-10
          "
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-zinc-600 sm:text-xs">
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
      <h2 className="text-base font-medium text-white sm:text-lg">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

interface DashboardLoadingProps {
  message: string;
}

function DashboardLoading({
  message,
}: DashboardLoadingProps) {
  return (
    <section
      className="
        mt-6
        flex
        min-h-[360px]
        items-center
        justify-center
        rounded-2xl
        border
        border-white/10
        bg-white/[0.02]
        px-6
        py-12
        text-center

        sm:mt-8
        sm:min-h-[420px]
      "
    >
      <div className="flex max-w-sm flex-col items-center">
        <div
          className="
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-[#37CBFB]/20
            bg-[#37CBFB]/5

            sm:h-16
            sm:w-16
          "
        >
          <div
            className="
              absolute
              inset-0
              animate-ping
              rounded-2xl
              border
              border-[#37CBFB]/10
            "
          />

          <Activity
            size={24}
            className="relative text-[#37CBFB]"
          />
        </div>

        <h2 className="mt-5 text-base font-medium text-white sm:text-lg">
          Portfolio Analytics
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          {message}
        </p>

        <div className="mt-5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#37CBFB]" />

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#37CBFB] [animation-delay:150ms]" />

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#37CBFB] [animation-delay:300ms]" />
        </div>

        <p className="mt-5 max-w-xs text-xs leading-5 text-zinc-600">
          Os serviços podem estar sendo
          inicializados após um período sem
          acessos.
        </p>
      </div>
    </section>
  );
}

/* =====================================================
   APP
===================================================== */

function App() {
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
    useState("");

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState(
    "Conectando aos serviços...",
  );

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        setLoadingMessage(
          "Inicializando serviços...",
        );

        /*
         * Aqui Backend e n8n começam
         * a inicializar em paralelo.
         */
        await initializeServices();

        /*
         * Não precisamos esperar o n8n.
         * Assim que o backend estiver pronto,
         * buscamos os dados.
         */
        setLoadingMessage(
          "Carregando dados reais...",
        );

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
          "Não foi possível conectar ao Analytics.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

        <header
          className="
            border-b
            border-white/10
            pb-7

            sm:pb-8

            lg:pb-10
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6

              lg:flex-row
              lg:items-end
              lg:justify-between
              lg:gap-10
            "
          >
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-xs text-zinc-400 sm:text-sm">
                  Dados reais · Live
                </span>
              </div>

              <h1
                className="
                  max-w-4xl
                  text-3xl
                  font-semibold
                  tracking-tight

                  sm:text-4xl

                  md:text-5xl
                "
              >
                Portfolio Analytics
              </h1>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-zinc-400

                  sm:mt-4
                  sm:text-base
                  sm:leading-7
                "
              >
                Plataforma própria de
                analytics desenvolvida para
                acompanhar comportamento,
                engajamento e conversões do meu
                portfólio.
              </p>
            </div>

            <div
              className="
                grid
                w-full
                grid-cols-1
                gap-2

                sm:flex
                sm:w-auto
                sm:flex-wrap
                sm:gap-3
              "
            >
              <a
                href="https://github.com/matheusconaga"
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  px-4
                  py-2.5
                  text-sm
                  text-zinc-300
                  transition

                  hover:border-white/20
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <GitFork size={16} />

                GitHub

                <ExternalLink size={14} />
              </a>

              <a
                href="https://portifoliomatheuslula.onrender.com/"
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-black
                  transition

                  hover:bg-zinc-200
                "
              >
                Meu portfólio

                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </header>

        {/* =================================================
            INTRO
        ================================================= */}

        <section className="mt-6 sm:mt-8 lg:mt-10">
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.02]
              p-4

              sm:p-6
            "
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-emerald-400/10
                  bg-emerald-400/5
                "
              >
                <Activity
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200">
                  Analytics em funcionamento
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                  Este dashboard utiliza
                  dados reais e anonimizados
                  do meu próprio portfólio.
                  Sua visita também pode
                  contribuir para estas
                  métricas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <DashboardLoading
            message={loadingMessage}
          />
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <section
            className="
              mt-8
              flex
              min-h-[280px]
              items-center
              justify-center
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/5
              p-6
              text-center
            "
          >
            <div className="flex max-w-sm flex-col items-center">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  text-red-400
                "
              >
                <Activity size={21} />
              </div>

              <h2 className="mt-4 font-medium text-white">
                Analytics indisponível
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-black
                  transition

                  hover:bg-zinc-200
                "
              >
                <RefreshCw size={15} />

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
              {/* OVERVIEW */}

              <section className="mt-7 sm:mt-8">
                <SectionHeader
                  title="Visão geral"
                  description="Dados dos últimos 7 dias."
                />

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3

                    sm:gap-4

                    lg:grid-cols-4
                  "
                >
                  <MetricCard
                    title="Visitantes"
                    value={
                      stats.overview
                        .visitors
                    }
                    description="Visitantes únicos"
                    icon={
                      <Users size={18} />
                    }
                  />

                  <MetricCard
                    title="Sessões"
                    value={
                      stats.overview
                        .sessions
                    }
                    description="Sessões iniciadas"
                    icon={
                      <BarChart3
                        size={18}
                      />
                    }
                  />

                  <MetricCard
                    title="Page Views"
                    value={
                      stats.overview
                        .pageViews
                    }
                    description="Visualizações de página"
                    icon={
                      <Eye size={18} />
                    }
                  />

                  <MetricCard
                    title="Projetos"
                    value={
                      stats.overview
                        .projectViews
                    }
                    description="Visitas à seção de projetos"
                    icon={
                      <MousePointerClick
                        size={18}
                      />
                    }
                  />
                </div>
              </section>

              {/* TIMELINE */}

              {timeline && (
                <section className="mt-8 sm:mt-10 lg:mt-12">
                  <SectionHeader
                    title="Evolução"
                    description="Evolução das principais métricas do portfólio."
                  />

                  <TimelineChart
                    data={timeline.data}
                  />
                </section>
              )}

              {/* PROJECTS */}

              {projects && (
                <section className="mt-8 sm:mt-10 lg:mt-12">
                  <SectionHeader
                    title="Projetos"
                    description="Projetos que mais despertaram interesse dos visitantes."
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
                  title="Interações"
                  description="Ações realizadas pelos visitantes."
                />

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-3

                    sm:grid-cols-3
                    sm:gap-4
                  "
                >
                  <MetricCard
                    title="Interações"
                    value={
                      stats
                        .interactions
                        .total
                    }
                    description="Total de ações registradas"
                    icon={
                      <MousePointerClick
                        size={18}
                      />
                    }
                  />

                  <MetricCard
                    title="GitHub"
                    value={
                      stats
                        .interactions
                        .githubClicks
                    }
                    description="Acessos aos repositórios"
                    icon={
                      <GitFork
                        size={18}
                      />
                    }
                  />

                  <MetricCard
                    title="Currículo"
                    value={
                      stats
                        .interactions
                        .resumeDownloads
                    }
                    description="Downloads do currículo"
                    icon={
                      <FileDown
                        size={18}
                      />
                    }
                  />
                </div>
              </section>
            </>
          )}

        {/* =================================================
            STACK
        ================================================= */}

        {!loading &&
          !error &&
          stats && (
            <section
              className="
                mt-10
                border-t
                border-white/10
                pt-6

                sm:mt-12
                sm:pt-8

                lg:mt-14
              "
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 sm:text-xs">
                Construído com
              </p>

              <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                {[
                  "React",
                  "TypeScript",
                  "Node.js",
                  "Express",
                  "Prisma",
                  "PostgreSQL",
                  "n8n",
                ].map(
                  (technology) => (
                    <span
                      key={
                        technology
                      }
                      className="
                        rounded-lg
                        border
                        border-white/10
                        bg-white/[0.03]
                        px-2.5
                        py-1.5
                        text-[11px]
                        text-zinc-400

                        sm:px-3
                        sm:text-xs
                      "
                    >
                      {technology}
                    </span>
                  ),
                )}
              </div>
            </section>
          )}

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          !error &&
          stats && (
            <footer
              className="
                mt-8
                flex
                flex-col
                gap-3
                border-t
                border-white/10
                pt-6
                text-xs
                text-zinc-600

                sm:mt-10
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <span>
                Portfolio Analytics · Dados
                anonimizados
              </span>

              <span>
                React + Node.js + PostgreSQL
              </span>
            </footer>
          )}
      </div>
    </main>
  );
}

export default App;