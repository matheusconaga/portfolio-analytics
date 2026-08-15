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

export default router;