export type AnalyticsPeriod =
  | "today"
  | "7d"
  | "30d"
  | "all";

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

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
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
   API HEALTH / COLD START
===================================================== */

export async function waitForApi() {
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
        return;
      }
    } catch (error) {
      console.log(
        `API ainda não disponível. Tentativa ${attempt}/${maxAttempts}.`,
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