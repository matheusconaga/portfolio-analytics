import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  TimelinePoint,
} from "../api";

import {
  useAppTranslation,
} from "../shared/hooks/useAppTranslation";

interface TimelineChartProps {
  data: TimelinePoint[];
}

function getDateLocale(
  language: "pt" | "en",
) {
  return language === "pt"
    ? "pt-BR"
    : "en-US";
}

function formatShortDate(
  value: string,
  language: "pt" | "en",
) {
  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString(
    getDateLocale(language),
    {
      day: "2-digit",
      month: "2-digit",
    },
  );
}

function formatFullDate(
  value: string,
  language: "pt" | "en",
) {
  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString(
    getDateLocale(language),
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

export default function TimelineChart({
  data,
}: TimelineChartProps) {
  const {
    t,
    language,
  } = useAppTranslation();

  if (!data.length) {
    return (
      <div
        className="
          flex
          min-h-[280px]

          items-center
          justify-center

          rounded-xl

          border
          border-white/10

          bg-white/[0.025]

          p-6
        "
      >
        <p className="text-center text-sm text-zinc-500">
          {t(
            "timeline.empty",
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        min-w-0
        overflow-hidden

        rounded-xl

        border
        border-white/10

        bg-white/[0.025]

        p-4
        sm:p-5
        lg:p-6
      "
    >
      <div
        className="
          h-[280px]
          w-full
          min-w-0

          sm:h-[320px]
          lg:h-[360px]
        "
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
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
              tickFormatter={(
                value,
              ) =>
                formatShortDate(
                  String(value),
                  language,
                )
              }
              tick={{
                fill: "#71717a",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />

            <YAxis
              allowDecimals={
                false
              }
              tick={{
                fill: "#71717a",
                fontSize: 10,
              }}
              width={35}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              labelFormatter={(
                value,
              ) =>
                formatFullDate(
                  String(value),
                  language,
                )
              }
              contentStyle={{
                backgroundColor:
                  "#18181b",
                border:
                  "1px solid rgba(255,255,255,0.1)",
                borderRadius:
                  "8px",
                fontSize:
                  "12px",
              }}
              labelStyle={{
                color:
                  "#fafafa",
              }}
            />

            <Legend
              iconSize={7}
              wrapperStyle={{
                fontSize:
                  "11px",
                paddingTop:
                  "16px",
              }}
            />

            <Line
              type="monotone"
              dataKey="visitors"
              name={t(
                "timeline.visitors",
              )}
              stroke="#37CBFB"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
              }}
            />

            <Line
              type="monotone"
              dataKey="sessions"
              name={t(
                "timeline.sessions",
              )}
              stroke="#a1a1aa"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="pageViews"
              name={t(
                "timeline.pageViews",
              )}
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}