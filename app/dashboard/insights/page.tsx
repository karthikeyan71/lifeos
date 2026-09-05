import { getAuthUser } from "@/lib/supabase/auth";
import { getInsightsData } from "@/features/insights/queries/get-insights-data";
import { computeInsights, PERIOD_DAYS, type InsightsPeriod } from "@/features/insights/lib/compute";
import { addDays, todayString } from "@/features/habits/lib/dates";
import { InsightsView } from "./_components/insights-view";

const PERIODS: InsightsPeriod[] = ["7d", "30d", "90d"];

export default async function InsightsPage() {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const today = todayString();
  const longestWindow = Math.max(...PERIODS.map((period) => PERIOD_DAYS[period]));
  const raw = await getInsightsData(user.id, addDays(today, -(longestWindow - 1)), today);

  const byPeriod = Object.fromEntries(
    PERIODS.map((period) => [period, computeInsights(raw, period, today)]),
  ) as Record<InsightsPeriod, ReturnType<typeof computeInsights>>;

  const hasAnyData =
    raw.tasks.length > 0 || raw.goals.length > 0 || raw.habits.length > 0;

  return <InsightsView byPeriod={byPeriod} hasAnyData={hasAnyData} />;
}
