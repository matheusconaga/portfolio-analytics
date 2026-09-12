import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

const COOKIE_NAME =
  "analytics_token";

export interface AuthenticatedRequest
  extends Request {
  admin?: {
    role: "admin";
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token =
    req.cookies?.[
      COOKIE_NAME
    ];

  if (!token) {
    res.status(401).json({
      error:
        "Authentication required",
    });

    return;
  }

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    console.error(
      "JWT_SECRET is not configured",
    );

    res.status(500).json({
      error:
        "Authentication is not configured",
    });

    return;
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
      res.status(401).json({
        error:
          "Invalid authentication token",
      });

      return;
    }

    req.admin = {
      role: "admin",
    };

    next();
  } catch {
    res.status(401).json({
      error:
        "Invalid or expired authentication token",
    });
  }
}

