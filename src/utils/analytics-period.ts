export type AnalyticsPeriod =
  | "today"
  | "7d"
  | "30d"
  | "all";

export function getPeriodStart(
  period: AnalyticsPeriod,
): Date | undefined {
  const now = new Date();

  switch (period) {
    case "today": {
      const start = new Date(now);

      start.setHours(0, 0, 0, 0);

      return start;
    }

    case "7d": {
      const start = new Date(now);

      start.setHours(0, 0, 0, 0);
      start.setDate(
        start.getDate() - 6,
      );

      return start;
    }

    case "30d": {
      const start = new Date(now);

      start.setHours(0, 0, 0, 0);
      start.setDate(
        start.getDate() - 29,
      );

      return start;
    }

    case "all":
    default:
      return undefined;
  }
}