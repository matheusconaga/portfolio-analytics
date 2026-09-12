import type {
    Request,
    Response,
} from "express";

import {
    getServicesStatus,
    getSystemMetrics,
} from "./monitoring.service.js";

export async function getServerStatus(
    _request: Request,
    response: Response,
): Promise<void> {
    try {
        const [
            system,
            services,
        ] = await Promise.all([
            getSystemMetrics(),
            getServicesStatus(),
        ]);

        response.status(200).json({
            device: {
                name:
                    process.env.DEVICE_NAME ??
                    "Unknown Device",

                status: "online",
            },

            system,

            services,

            timestamp:
                new Date().toISOString(),
        });
    } catch (error) {
        console.error(
            "Failed to get server status:",
            error,
        );

        response.status(500).json({
            error:
                "Failed to get server status",
        });
    }
}