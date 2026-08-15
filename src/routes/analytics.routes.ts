import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../database/prisma.js";

const router = Router();

router.post("/session", async (req, res) => {
  try {
    const { visitorId } = req.body;

    let currentVisitorId = visitorId;

    if (!currentVisitorId) {
      currentVisitorId = randomUUID();

      await prisma.visitor.create({
        data: {
          id: currentVisitorId,
        },
      });
    } else {
      const visitor = await prisma.visitor.findUnique({
        where: {
          id: currentVisitorId,
        },
      });

      if (!visitor) {
        return res.status(404).json({
          error: "Visitor not found",
        });
      }
    }

    const session = await prisma.session.create({
      data: {
        id: randomUUID(),
        visitorId: currentVisitorId,
        referrer: req.headers.referer || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    // Notifica o n8n sobre a criação de uma nova sessão
    const n8nWebhookUrl = process.env.N8N_VISIT_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.id,
            source: req.headers.referer || "Direct",
          }),
        });

        console.log("n8n webhook status:", response.status);

        if (!response.ok) {
          const responseBody = await response.text();

          console.error(
            "n8n webhook failed:",
            response.status,
            responseBody,
          );
        }
      } catch (error) {
        console.error("Failed to notify n8n:", error);
      }
    } else {
      console.warn("N8N_VISIT_WEBHOOK_URL is not configured");
    }

    res.status(201).json({
      visitorId: currentVisitorId,
      sessionId: session.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create analytics session",
    });
  }
});

router.post("/event", async (req, res) => {
  try {
    const {
      sessionId,
      type,
      page,
      projectSlug,
      metadata,
    } = req.body;

    if (!sessionId || !type) {
      return res.status(400).json({
        error: "sessionId and type are required",
      });
    }

    const event = await prisma.event.create({
      data: {
        id: randomUUID(),
        sessionId,
        type,
        page: page || null,
        projectSlug: projectSlug || null,
        metadata: metadata || null,
      },
    });

    await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        lastActivityAt: new Date(),
      },
    });

    res.status(201).json({
      eventId: event.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create analytics event",
    });
  }
});

router.get("/session/:sessionId/summary", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        visitor: {
          include: {
            sessions: {
              select: {
                id: true,
              },
            },
          },
        },
        events: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    // --------------------------------------------------
    // Visitante novo ou recorrente
    // --------------------------------------------------

    const visitorType =
      session.visitor.sessions.length <= 1
        ? "new"
        : "returning";

    // --------------------------------------------------
    // Origem
    // --------------------------------------------------

    const referrer = session.referrer;

    let source = "Acesso direto";

    if (referrer) {
      const normalizedReferrer = referrer.toLowerCase();

      if (normalizedReferrer.includes("linkedin")) {
        source = "LinkedIn";
      } else if (normalizedReferrer.includes("github")) {
        source = "GitHub";
      } else if (normalizedReferrer.includes("google")) {
        source = "Google";
      } else if (
        normalizedReferrer.includes("portifoliomatheuslula")
      ) {
        source = "Acesso direto";
      } else {
        try {
          source = new URL(referrer).hostname.replace("www.", "");
        } catch {
          source = referrer;
        }
      }
    }

    // --------------------------------------------------
    // Dispositivo
    // --------------------------------------------------

    const userAgent = session.userAgent?.toLowerCase() || "";

    let device = "Desktop";

    if (/ipad|tablet/.test(userAgent)) {
      device = "Tablet";
    } else if (/mobile|android|iphone/.test(userAgent)) {
      device = "Mobile";
    }

    // --------------------------------------------------
    // Navegador
    // --------------------------------------------------

    let browser = "Outro";

    if (userAgent.includes("edg/")) {
      browser = "Edge";
    } else if (userAgent.includes("opr/")) {
      browser = "Opera";
    } else if (
      userAgent.includes("chrome/") &&
      !userAgent.includes("edg/")
    ) {
      browser = "Chrome";
    } else if (
      userAgent.includes("safari/") &&
      !userAgent.includes("chrome/")
    ) {
      browser = "Safari";
    } else if (userAgent.includes("firefox/")) {
      browser = "Firefox";
    }

    // --------------------------------------------------
    // Páginas / seções visualizadas
    // --------------------------------------------------

    const sectionNames: Record<string, string> = {
      "/": "Home",
      home: "Home",
      about: "Sobre mim",
      projects: "Projetos",
      tech: "Tecnologias",
      skills: "Competências",
      experience: "Experiência",
      contact: "Contato",
    };

    const viewedSections = new Set<string>();

    for (const event of session.events) {
      if (event.page) {
        viewedSections.add(
          sectionNames[event.page] || event.page,
        );
      }

      if (
        event.type === "section_view" &&
        event.metadata &&
        typeof event.metadata === "object" &&
        !Array.isArray(event.metadata)
      ) {
        const metadata = event.metadata as Record<string, unknown>;
        const section = metadata.section;

        if (typeof section === "string") {
          viewedSections.add(
            sectionNames[section] || section,
          );
        }
      }
    }

    const sections = [...viewedSections];

    // --------------------------------------------------
    // Interações
    // --------------------------------------------------

    const projectNames: Record<string, string> = {
      "docflow-ai": "DocFlow AI",
      "gestao-patrimonial": "Gestão Patrimonial",
      println: "PrintLn",
      portfolio: "Portfólio",
    };

    const interactionNames: Record<string, string> = {
      project_view: "Visualizou um projeto",
      github_click: "Clicou no GitHub do projeto",
      github_profile_click: "Acessou seu perfil no GitHub",
      demo_click: "Abriu a demonstração de um projeto",
      contact_click: "Interagiu com a área de contato",
      resume_download: "Baixou seu currículo",
      whatsapp_click: "Clicou no WhatsApp",
      email_click: "Clicou no e-mail",
      linkedin_click: "Acessou seu LinkedIn",
    };

    const interactions = session.events
      .filter(
        (event) =>
          event.type !== "page_view" &&
          event.type !== "section_view",
      )
      .map((event) => {
        const projectName = event.projectSlug
          ? projectNames[event.projectSlug] || event.projectSlug
          : null;

        let label =
          interactionNames[event.type] ||
          event.type;

        if (
          event.type === "project_view" &&
          projectName
        ) {
          label = `Visualizou o projeto ${projectName}`;
        }

        if (
          event.type === "github_click" &&
          projectName
        ) {
          label = `Clicou no GitHub — ${projectName}`;
        }

        if (
          event.type === "demo_click" &&
          projectName
        ) {
          label = `Abriu a demonstração — ${projectName}`;
        }

        return {
          type: event.type,
          label,
          projectSlug:
            event.projectSlug || null,
          projectName,
          metadata:
            event.metadata || null,
        };
      });

    // --------------------------------------------------
    // Duração
    // --------------------------------------------------

    const durationSeconds = Math.max(
      0,
      Math.round(
        (
          session.lastActivityAt.getTime() -
          session.startedAt.getTime()
        ) / 1000,
      ),
    );

    // Consideramos a sessão ativa se houve atividade
    // nos últimos 90 segundos.
    const inactivityThreshold = 90 * 1000;

    const active =
      Date.now() - session.lastActivityAt.getTime() <
      inactivityThreshold;

    // --------------------------------------------------

    res.json({
      sessionId: session.id,
      visitorType,
      source,
      device,
      browser,
      sections,
      interactions,
      durationSeconds,
      active,
      startedAt: session.startedAt,
      lastActivityAt: session.lastActivityAt,
    });
  } catch (error) {
    console.error("Failed to generate session summary:", error);

    res.status(500).json({
      error: "Failed to generate session summary",
    });
  }
});

export default router;