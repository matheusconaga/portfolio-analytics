import {
  Router,
} from "express";

import {
  getServerStatus,
} from "./monitoring.controller.js";

export const monitoringRouter =
  Router();

monitoringRouter.get(
  "/server/status",
  getServerStatus,
);