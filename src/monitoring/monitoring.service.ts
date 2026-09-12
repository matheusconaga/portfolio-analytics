import os from "node:os";
import { statfs } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
    prisma,
} from "../database/prisma.js";

const execFileAsync =
    promisify(execFile);

interface CpuTimes {
    idle: number;
    total: number;
}

export interface ServiceStatus {
    status: "online" | "offline";
    latency: number | null;
}

export interface BatteryMetrics {
    percentage: number;
    charging: boolean;
    plugged: string;
    status: string;
    health: string;
    temperature: number | null;
}

export interface SystemMetrics {
    cpu: {
        usage: number;
        cores: number;
    };

    memory: {
        used: number;
        free: number;
        total: number;
        percentage: number;
    };

    disk: {
        used: number;
        free: number;
        total: number;
        percentage: number;
    };

    battery:
    BatteryMetrics | null;

    uptime: number;
}

async function checkDatabase(): Promise<ServiceStatus> {
    const start =
        performance.now();

    try {
        await prisma.$queryRaw`
      SELECT 1
    `;

        const latency =
            Math.round(
                performance.now() -
                start,
            );

        return {
            status: "online",
            latency,
        };
    } catch (error) {
        console.error(
            "Database health check failed:",
            error,
        );

        return {
            status: "offline",
            latency: null,
        };
    }
}

function getCpuTimes(): CpuTimes {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
        idle += cpu.times.idle;

        total +=
            cpu.times.user +
            cpu.times.nice +
            cpu.times.sys +
            cpu.times.idle +
            cpu.times.irq;
    }

    return {
        idle,
        total,
    };
}

async function getCpuUsage(): Promise<number> {
    const start = getCpuTimes();

    await new Promise<void>((resolve) => {
        setTimeout(resolve, 250);
    });

    const end = getCpuTimes();

    const idleDifference =
        end.idle - start.idle;

    const totalDifference =
        end.total - start.total;

    if (totalDifference <= 0) {
        return 0;
    }

    const usage =
        100 -
        (idleDifference /
            totalDifference) *
        100;

    return Number(
        usage.toFixed(1),
    );
}

function getMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    const percentage =
        total > 0
            ? (used / total) * 100
            : 0;

    return {
        used,
        free,
        total,

        percentage: Number(
            percentage.toFixed(1),
        ),
    };
}

async function getDiskMetrics() {
    /*
     * No Termux, HOME fica no armazenamento
     * interno usado pelos arquivos do servidor.
     */
    const targetPath =
        process.env.HOME ??
        process.cwd();

    const stats =
        await statfs(targetPath);

    const total =
        stats.blocks *
        stats.bsize;

    const free =
        stats.bavail *
        stats.bsize;

    const used =
        total - free;

    const percentage =
        total > 0
            ? (used / total) * 100
            : 0;

    return {
        used,
        free,
        total,

        percentage: Number(
            percentage.toFixed(1),
        ),
    };
}

export async function getBatteryMetrics(): Promise<BatteryMetrics | null> {
    try {
        const {
            stdout,
        } = await execFileAsync(
            "termux-battery-status",
        );

        const battery =
            JSON.parse(stdout) as {
                percentage?: number;
                plugged?: string;
                status?: string;
                health?: string;
                temperature?: number;
            };

        return {
            percentage:
                battery.percentage ?? 0,

            charging:
                battery.status ===
                "CHARGING" ||
                battery.status ===
                "FULL",

            plugged:
                battery.plugged ??
                "UNKNOWN",

            status:
                battery.status ??
                "UNKNOWN",

            health:
                battery.health ??
                "UNKNOWN",

            temperature:
                battery.temperature ??
                null,
        };
    } catch {
        /*
         * Fora do Termux/Android,
         * termux-battery-status não existe.
         */
        return null;
    }
}

async function checkHttpService(
    url: string,
): Promise<ServiceStatus> {
    const start =
        performance.now();

    try {
        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 5_000);

        const response =
            await fetch(url, {
                signal:
                    controller.signal,
            });

        clearTimeout(timeout);

        const latency =
            Math.round(
                performance.now() -
                start,
            );

        return {
            status: response.ok
                ? "online"
                : "offline",

            latency,
        };
    } catch {
        return {
            status: "offline",
            latency: null,
        };
    }
}

export async function getServicesStatus() {
    const n8nUrl =
        process.env.N8N_INTERNAL_URL ??
        "http://127.0.0.1:5678";

    const publicAnalyticsUrl =
        process.env.PUBLIC_ANALYTICS_URL;

    const [
        n8n,
        cloudflare,
        neon,
    ] = await Promise.all([
        checkHttpService(
            n8nUrl,
        ),

        publicAnalyticsUrl
            ? checkHttpService(
                `${publicAnalyticsUrl}/api/health`,
            )
            : Promise.resolve({
                status:
                    "offline" as const,
                latency: null,
            }),

        checkDatabase(),
    ]);

    return {
        analytics: {
            status:
                "online" as const,
            latency: 0,
        },

        n8n,
        neon,
        cloudflare,
    };
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
    const [
        cpuUsage,
        disk,
        battery,
    ] = await Promise.all([
        getCpuUsage(),
        getDiskMetrics(),
        getBatteryMetrics(),
    ]);

    const memory =
        getMemoryMetrics();

    return {
        cpu: {
            usage: cpuUsage,
            cores: os.cpus().length,
        },

        memory,

        disk,

        battery,

        uptime: Math.floor(
            os.uptime(),
        ),
    };
}