import os from "node:os";
import {
    readFile,
    statfs,
} from "node:fs/promises"; import { execFile } from "node:child_process";
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

async function getAndroidCpuCoreCount(): Promise<number> {
    try {
        const value =
            await readFile(
                "/sys/devices/system/cpu/online",
                "utf8",
            );

        const ranges =
            value.trim().split(",");

        let cores = 0;

        for (const range of ranges) {
            const [
                start,
                end,
            ] = range
                .split("-")
                .map(Number);

            if (
                Number.isFinite(start) &&
                Number.isFinite(end)
            ) {
                cores +=
                    end - start + 1;
            } else if (
                Number.isFinite(start)
            ) {
                cores += 1;
            }
        }

        return cores;
    } catch {
        return 0;
    }
}

async function getCpuUsageFromTop(
    cores: number,
): Promise<number> {
    try {
        const {
            stdout,
        } = await execFileAsync(
            "top",
            [
                "-b",
                "-n",
                "1",
                "-o",
                "%CPU",
            ],
        );

        const lines =
            stdout.split("\n");

        let totalProcessCpu = 0;

        for (const line of lines) {
            const value =
                line.trim();

            /*
             * Com -o %CPU, as linhas dos
             * processos contêm somente números.
             */
            if (
                !/^\d+(\.\d+)?$/.test(
                    value,
                )
            ) {
                continue;
            }

            const cpu =
                Number(value);

            if (
                Number.isFinite(cpu)
            ) {
                totalProcessCpu +=
                    cpu;
            }
        }

        if (cores <= 0) {
            return 0;
        }

        /*
         * O top pode mostrar até 100%
         * por núcleo.
         *
         * Ex:
         * 100% em um processo com
         * 8 núcleos = ~12.5% total.
         */
        const usage =
            totalProcessCpu /
            cores;

        return Number(
            Math.max(
                0,
                Math.min(
                    100,
                    usage,
                ),
            ).toFixed(1),
        );
    } catch {
        return 0;
    }
}

async function getCpuUsage(): Promise<{
    usage: number;
    cores: number;
}> {
    const nodeCpus =
        os.cpus();

    /*
     * Windows / Linux convencional.
     */
    if (nodeCpus.length > 0) {
        const start =
            getCpuTimes();

        await new Promise<void>(
            (resolve) => {
                setTimeout(
                    resolve,
                    250,
                );
            },
        );

        const end =
            getCpuTimes();

        const idleDifference =
            end.idle -
            start.idle;

        const totalDifference =
            end.total -
            start.total;

        const usage =
            totalDifference > 0
                ? 100 -
                (idleDifference /
                    totalDifference) *
                100
                : 0;

        return {
            usage: Number(
                usage.toFixed(1),
            ),

            cores:
                nodeCpus.length,
        };
    }

    /*
     * Android / Termux.
     */
    const cores =
        await getAndroidCpuCoreCount();

    const usage =
        await getCpuUsageFromTop(
            cores,
        );

    return {
        usage,
        cores,
    };
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
        cpu,
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
        cpu,

        memory,

        disk,

        battery,

        uptime: Math.floor(
            os.uptime(),
        ),
    };
}