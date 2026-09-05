import { Newsreader } from "next/font/google";
import { getAuthUser } from "@/lib/supabase/auth";
import { getNotificationSettings } from "@/features/reminders/queries/get-notification-settings";
import { NotificationSettings } from "./_components/notification-settings";
import { PwaInstall } from "./_components/pwa-install";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

export default async function SettingsPage() {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const { pushConfigured, timezone } = await getNotificationSettings(user.id);

  return (
    <div className="flex flex-col gap-8 p-5 sm:p-8">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2c423b]">
          Preferences
        </span>
        <h1
          className={`${newsreader.className} text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[#162c26] sm:text-[32px] sm:leading-[40px]`}
        >
          Settings
        </h1>
        <p className="max-w-xl text-[13.5px] leading-[20px] text-[#605e5a]">
          Manage how LifeOS reaches you.
        </p>
      </header>

      <div className="flex max-w-2xl flex-col gap-6">
        <NotificationSettings pushConfigured={pushConfigured} storedTimezone={timezone} />
        <PwaInstall />
      </div>
    </div>
  );
}
