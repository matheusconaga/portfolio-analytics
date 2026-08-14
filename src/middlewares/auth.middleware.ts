import {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt from "jsonwebtoken";

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
) {
  try {
    const token =
      req.cookies?.analytics_token;

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET is not configured",
      );

      return res.status(500).json({
        error:
          "Authentication is not configured",
      });
    }

    const payload = jwt.verify(
      token,
      secret,
    );

    if (
      typeof payload !== "object" ||
      payload.role !== "admin"
    ) {
      return res.status(401).json({
        error:
          "Invalid authentication token",
      });
    }

    req.admin = {
      role: "admin",
    };

    next();
  } catch {
    return res.status(401).json({
      error:
        "Invalid or expired authentication token",
    });
  }
}