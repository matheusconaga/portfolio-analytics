import { Router } from "express";

import { prisma } from "../database/prisma.js";

import {
    AnalyticsPeriod,
    getPeriodStart,
} from "../utils/analytics-period.js";

const router = Router();

router.get("/stats", async (req, res) => {
    try {
        const period =
            (req.query.period as AnalyticsPeriod) ||
            "7d";

        const validPeriods: AnalyticsPeriod[] = [
            "today",
            "7d",
            "30d",
            "all",
        ];

        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                error: "Invalid period",
                validPeriods,
            });
        }

        const periodStart =
            getPeriodStart(period);

        const eventWhere = periodStart
            ? {
                createdAt: {
                    gte: periodStart,
                },
            }
            : {};

        const sessionWhere = periodStart
            ? {
                startedAt: {
                    gte: periodStart,
                },
            }
            : {};

        const [
            visitors,
            sessions,
            pageViews,
            projectViews,
            githubClicks,
            demoClicks,
            linkedinClicks,
            whatsappClicks,
            emailClicks,
            resumeDownloads,
        ] = await Promise.all([
            prisma.visitor.count({
                where: periodStart
                    ? {
                        sessions: {
                            some: {
                                startedAt: {
                                    gte: periodStart,
                                },
                            },
                        },
                    }
                    : undefined,
            }),

            prisma.session.count({
                where: sessionWhere,
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "page_view",
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "section_view",
                    metadata: {
                        path: ["section"],
                        equals: "projects",
                    },
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "github_click",
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "demo_click",
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "linkedin_click",
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "whatsapp_click",
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "email_click",
                },
            }),

            prisma.event.count({
                where: {
                    ...eventWhere,
                    type: "resume_download",
                },
            }),
        ]);

        const totalInteractions =
            githubClicks +
            demoClicks +
            linkedinClicks +
            whatsappClicks +
            emailClicks +
            resumeDownloads;

        return res.json({
            period,

            overview: {
                visitors,
                sessions,
                pageViews,
                projectViews,
            },

            interactions: {
                total: totalInteractions,
                githubClicks,
                demoClicks,
                linkedinClicks,
                whatsappClicks,
                emailClicks,
                resumeDownloads,
            },
        });
    } catch (error) {
        console.error(
            "Failed to fetch public analytics stats:",
            error,
        );

        return res.status(500).json({
            error:
                "Failed to fetch public analytics stats",
        });
    }
});
router.get("/timeline", async (req, res) => {
    try {
        const period =
            (req.query.period as AnalyticsPeriod) ||
            "7d";

        const validPeriods: AnalyticsPeriod[] = [
            "today",
            "7d",
            "30d",
            "all",
        ];

        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                error: "Invalid period",
                validPeriods,
            });
        }

        const periodStart =
            getPeriodStart(period);

        const sessions =
            await prisma.session.findMany({
                where: periodStart
                    ? {
                        startedAt: {
                            gte: periodStart,
                        },
                    }
                    : undefined,

                select: {
                    visitorId: true,
                    startedAt: true,
                },

                orderBy: {
                    startedAt: "asc",
                },
            });

        const events =
            await prisma.event.findMany({
                where: periodStart
                    ? {
                        createdAt: {
                            gte: periodStart,
                        },
                    }
                    : undefined,

                select: {
                    type: true,
                    createdAt: true,
                },

                orderBy: {
                    createdAt: "asc",
                },
            });

        const timeline = new Map<
            string,
            {
                date: string;
                visitors: Set<string>;
                sessions: number;
                pageViews: number;
                projectViews: number;
            }
        >();

        function getDateKey(date: Date) {
            return date
                .toISOString()
                .split("T")[0];
        }

        for (const session of sessions) {
            const date =
                getDateKey(session.startedAt);

            if (!timeline.has(date)) {
                timeline.set(date, {
                    date,
                    visitors: new Set(),
                    sessions: 0,
                    pageViews: 0,
                    projectViews: 0,
                });
            }

            const item = timeline.get(date)!;

            item.sessions += 1;
            item.visitors.add(
                session.visitorId,
            );
        }

        for (const event of events) {
            const date =
                getDateKey(event.createdAt);

            if (!timeline.has(date)) {
                timeline.set(date, {
                    date,
                    visitors: new Set(),
                    sessions: 0,
                    pageViews: 0,
                    projectViews: 0,
                });
            }

            const item = timeline.get(date)!;

            if (event.type === "page_view") {
                item.pageViews += 1;
            }

            if (event.type === "project_view") {
                item.projectViews += 1;
            }
        }

        const data = Array.from(
            timeline.values(),
        )
            .sort((a, b) =>
                a.date.localeCompare(b.date),
            )
            .map((item) => ({
                date: item.date,
                visitors:
                    item.visitors.size,
                sessions: item.sessions,
                pageViews: item.pageViews,
                projectViews:
                    item.projectViews,
            }));

        return res.json({
            period,
            data,
        });
    } catch (error) {
        console.error(
            "Failed to fetch public analytics timeline:",
            error,
        );

        return res.status(500).json({
            error:
                "Failed to fetch public analytics timeline",
        });
    }
});

router.get("/projects", async (req, res) => {
    try {
        const period =
            (req.query.period as AnalyticsPeriod) ||
            "7d";

        const validPeriods: AnalyticsPeriod[] = [
            "today",
            "7d",
            "30d",
            "all",
        ];

        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                error: "Invalid period",
                validPeriods,
            });
        }

        const periodStart =
            getPeriodStart(period);

        const events =
            await prisma.event.findMany({
                where: {
                    ...(periodStart
                        ? {
                            createdAt: {
                                gte: periodStart,
                            },
                        }
                        : {}),

                    projectSlug: {
                        not: null,
                    },
                },

                select: {
                    type: true,
                    projectSlug: true,
                },
            });

        const projectNames: Record<
            string,
            string
        > = {
            "docflow-ai": "DocFlow AI",
            patrimoniario:
                "Gestão Patrimonial",
            println: "PrintLn",
            portfolio: "Portfólio",
        };

        const projects = new Map<
            string,
            {
                slug: string;
                name: string;
                views: number;
                githubClicks: number;
                demoClicks: number;
            }
        >();

        for (const event of events) {
            if (!event.projectSlug) {
                continue;
            }

            const slug =
                event.projectSlug;

            if (!projects.has(slug)) {
                projects.set(slug, {
                    slug,
                    name:
                        projectNames[slug] ||
                        slug,
                    views: 0,
                    githubClicks: 0,
                    demoClicks: 0,
                });
            }

            const project =
                projects.get(slug)!;

            if (
                event.type === "project_view"
            ) {
                project.views += 1;
            }

            if (
                event.type === "github_click"
            ) {
                project.githubClicks += 1;
            }

            if (
                event.type === "demo_click"
            ) {
                project.demoClicks += 1;
            }
        }

        const data = Array.from(
            projects.values(),
        ).sort(
            (a, b) =>
                b.views - a.views,
        );

        return res.json({
            period,
            projects: data,
        });
    } catch (error) {
        console.error(
            "Failed to fetch public project analytics:",
            error,
        );

        return res.status(500).json({
            error:
                "Failed to fetch public project analytics",
        });
    }
});

export default router;