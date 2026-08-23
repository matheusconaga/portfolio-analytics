export type AnalyticsPeriod =
  | "today"
  | "7d"
  | "30d"
  | "all";

/* =====================================================
   TYPES
===================================================== */

export interface PublicStats {
  period: string;

  overview: {
    visitors: number;
    sessions: number;
    pageViews: number;
    projectViews: number;
  };

  interactions: {
    total: number;
    githubClicks: number;
    demoClicks: number;
    linkedinClicks: number;
    whatsappClicks: number;
    emailClicks: number;
    resumeDownloads: number;
  };
}

export interface TimelinePoint {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  projectViews: number;
}

export interface PublicTimelineResponse {
  period: string;
  data: TimelinePoint[];
}

export interface PublicProject {
  slug: string;
  name: string;
  views: number;
  githubClicks: number;
  demoClicks: number;
}

export interface PublicProjectsResponse {
  period: string;
  projects: PublicProject[];
}

/* =====================================================
   ENVIRONMENT
===================================================== */

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

const N8N_WARMUP_URL = (
  import.meta.env.VITE_N8N_WARMUP_URL ||
  ""
).replace(/\/$/, "");

/* =====================================================
   HELPERS
===================================================== */

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithTimeout(
  url: string,
  timeout = 10000,
) {
  const controller =
    new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    return await fetch(url, {
      signal: controller.signal,

      headers: {
        Accept: "application/json",
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =====================================================
   N8N WARMUP
===================================================== */

async function wakeN8n() {
  if (!N8N_WARMUP_URL) {
    console.warn(
      "VITE_N8N_WARMUP_URL não configurada.",
    );

    return;
  }

  try {
    /*
     * Não esperamos o conteúdo da resposta.
     *
     * O objetivo dessa requisição é apenas
     * fazer o Render começar a inicializar
     * o Web Service do n8n.
     */
    await fetch(N8N_WARMUP_URL, {
      method: "POST",

      /*
       * Como não precisamos ler a resposta
       * do n8n, evitamos depender do CORS
       * dele.
       */
      mode: "no-cors",
    });

    console.log(
      "Warmup do n8n enviado.",
    );
  } catch (error) {
    /*
     * Uma falha no n8n NÃO deve impedir
     * que o dashboard carregue.
     */
    console.warn(
      "Não foi possível iniciar o n8n:",
      error,
    );
  }
}

/* =====================================================
   BACKEND HEALTH
===================================================== */

async function waitForBackend() {
  const maxAttempts = 15;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      const response =
        await fetchWithTimeout(
          `${API_URL}/api/health`,
          10000,
        );

      const contentType =
        response.headers.get(
          "content-type",
        );

      if (
        response.ok &&
        contentType?.includes(
          "application/json",
        )
      ) {
        console.log(
          "Analytics API disponível.",
        );

        return;
      }
    } catch (error) {
      console.log(
        `Backend inicializando: ${attempt}/${maxAttempts}`,
      );
    }

    if (attempt < maxAttempts) {
      await sleep(3000);
    }
  }

  throw new Error(
    "API_UNAVAILABLE",
  );
}

/* =====================================================
   INITIALIZE SERVICES
===================================================== */

export async function initializeServices() {
  /*
   * Iniciamos o n8n imediatamente.
   *
   * Não usamos await aqui porque o dashboard
   * não precisa esperar o n8n terminar de
   * inicializar.
   */
  void wakeN8n();

  /*
   * O backend, por outro lado, é necessário
   * para carregar os dados.
   */
  await waitForBackend();
}

/* =====================================================
   STATS
===================================================== */

export async function getPublicStats(
  period: AnalyticsPeriod = "7d",
): Promise<PublicStats> {
  const response = await fetch(
    `${API_URL}/api/public/analytics/stats?period=${period}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch public analytics stats",
    );
  }

  return response.json();
}

/* =====================================================
   TIMELINE
===================================================== */

export async function getPublicTimeline(
  period: AnalyticsPeriod = "7d",
): Promise<PublicTimelineResponse> {
  const response = await fetch(
    `${API_URL}/api/public/analytics/timeline?period=${period}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch public analytics timeline",
    );
  }

  return response.json();
}

/* =====================================================
   PROJECTS
===================================================== */

export async function getPublicProjects(
  period: AnalyticsPeriod = "7d",
): Promise<PublicProjectsResponse> {
  const response = await fetch(
    `${API_URL}/api/public/analytics/projects?period=${period}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch public project analytics",
    );
  }

  return response.json();
}