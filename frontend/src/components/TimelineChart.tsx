import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type {
    TimelinePoint,
} from "../api";

interface TimelineChartProps {
    data: TimelinePoint[];
}

function formatDate(value: string) {
    return new Date(
        `${value}T00:00:00`,
    ).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });
}

export default function TimelineChart({
    data,
}: TimelineChartProps) {
    if (!data.length) {
        return (
            <div
                className="
          flex
          min-h-[260px]
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
          p-6

          sm:min-h-[320px]
        "
            >
                <p className="text-center text-sm text-zinc-500">
                    Nenhum dado registrado neste
                    período.
                </p>
            </div>
        );
    }

    return (
        <div
            className="
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-3

        sm:p-5

        lg:p-6
      "
        >
            <div className="mb-4 px-1 sm:mb-6">
                <h3 className="text-sm font-medium text-white sm:text-base">
                    Evolução de acessos
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                    Comportamento do portfólio ao longo
                    dos últimos dias.
                </p>
            </div>

            <div
                className="
          h-[280px]
          w-full
          min-w-0

          sm:h-[320px]

          md:h-[340px]

          lg:h-[380px]
        "
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 5,
                            left: -25,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.06)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{
                                fill: "#71717a",
                                fontSize: 10,
                            }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={20}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{
                                fill: "#71717a",
                                fontSize: 10,
                            }}
                            width={35}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            labelFormatter={(value) =>
                                new Date(
                                    `${String(value)}T00:00:00`,
                                ).toLocaleDateString(
                                    "pt-BR",
                                    {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    },
                                )
                            }
                            contentStyle={{
                                backgroundColor: "#18181b",
                                border:
                                    "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                fontSize: "12px",
                            }}
                            labelStyle={{
                                color: "#fafafa",
                            }}
                            itemStyle={{
                                fontSize: "12px",
                            }}
                        />

                        <Legend
                            iconSize={8}
                            wrapperStyle={{
                                fontSize: "10px",
                                paddingTop: "14px",
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="visitors"
                            name="Visitantes"
                            stroke="#37CBFB"
                            fill="#37CBFB"
                            fillOpacity={0.08}
                            strokeWidth={2}
                            activeDot={{
                                r: 4,
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="sessions"
                            name="Sessões"
                            stroke="#a1a1aa"
                            fill="#a1a1aa"
                            fillOpacity={0.04}
                            strokeWidth={2}
                        />

                        <Area
                            type="monotone"
                            dataKey="pageViews"
                            name="Page Views"
                            stroke="#34d399"
                            fill="#34d399"
                            fillOpacity={0.04}
                            strokeWidth={2}
                        />

                        <Area
                            type="monotone"
                            dataKey="projectViews"
                            name="Projetos"
                            stroke="#a78bfa"
                            fill="#a78bfa"
                            fillOpacity={0.04}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}