import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const COOKIE_NAME =
  "analytics_token";

const isProduction =
  process.env.NODE_ENV ===
  "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction
    ? ("none" as const)
    : ("lax" as const),
};

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        password,
      } = req.body;

      if (!password) {
        return res.status(400).json({
          error:
            "Password is required",
        });
      }

      const passwordHash =
        process.env
          .ADMIN_PASSWORD_HASH;

      const jwtSecret =
        process.env.JWT_SECRET;

      if (
        !passwordHash ||
        !jwtSecret
      ) {
        console.error(
          "Authentication environment variables are not configured",
        );

        return res
          .status(500)
          .json({
            error:
              "Authentication is not configured",
          });
      }

      const passwordValid =
        await bcrypt.compare(
          password,
          passwordHash,
        );

      if (!passwordValid) {
        return res
          .status(401)
          .json({
            error:
              "Invalid credentials",
          });
      }

      const token = jwt.sign(
        {
          role: "admin",
        },
        jwtSecret,
        {
          expiresIn: "7d",
        },
      );

      res.cookie(
        COOKIE_NAME,
        token,
        {
          ...cookieOptions,

          maxAge:
            7 *
            24 *
            60 *
            60 *
            1000,
        },
      );

      return res.json({
        authenticated: true,
      });
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to authenticate",
        });
    }
  },
);

router.get(
  "/me",
  (req, res) => {
    const token =
      req.cookies?.[
        COOKIE_NAME
      ];

    if (!token) {
      return res
        .status(401)
        .json({
          authenticated: false,
        });
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      return res
        .status(500)
        .json({
          error:
            "Authentication is not configured",
        });
    }

    try {
      const payload =
        jwt.verify(
          token,
          secret,
        );

      if (
        typeof payload !==
          "object" ||
        payload.role !==
          "admin"
      ) {
        return res
          .status(401)
          .json({
            authenticated: false,
          });
      }

      return res.json({
        authenticated: true,
        role: "admin",
      });
    } catch {
      return res
        .status(401)
        .json({
          authenticated: false,
        });
    }
  },
);

router.post(
  "/logout",
  (_req, res) => {
    res.clearCookie(
      COOKIE_NAME,
      cookieOptions,
    );

    return res.json({
      authenticated: false,
    });
  },
);

export default router;