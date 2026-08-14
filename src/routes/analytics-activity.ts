import { Router } from "express";

import { prisma } from "../database/prisma.js";

const router = Router();

router.post(
  "/activity",
  async (req, res) => {
    try {
      const {
        sessionId,
      } = req.body as {
        sessionId?: string;
      };

      if (!sessionId) {
        return res.status(400).json({
          error: "sessionId is required",
        });
      }

      const result =
        await prisma.session.updateMany({
          where: {
            id: sessionId,
          },

          data: {
            lastActivityAt:
              new Date(),
          },
        });

      if (
        result.count === 0
      ) {
        return res.status(404).json({
          error:
            "Session not found",
        });
      }

      return res.json({
        updated: true,
      });
    } catch (error) {
      console.error(
        "Failed to update session activity:",
        error,
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to update session activity",
        });
    }
  },
);

export default router;