"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReminderFieldProps = {
  id: string;
  /** `<input type="datetime-local">` value (local wall-clock, `YYYY-MM-DDTHH:mm`). */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/**
 * Optional reminder picker shared by the task / goal / habit forms. When a time
 * is set but the browser has not granted notification permission, it points the
 * user at Settings — the reminder is still saved either way.
 */
export function ReminderField({ id, value, onChange, disabled }: ReminderFieldProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const showHint = value !== "" && permission !== "granted";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]"
      >
        Reminder <span className="font-normal normal-case tracking-normal">(optional)</span>
      </label>
      <input
        id={id}
        type="datetime-local"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-[#c2c8c4]/50 bg-[#f4f3f1]/70 px-3 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
      />
      {value !== "" && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="self-start text-[12px] font-medium text-[#605e5a] underline-offset-2 hover:underline"
        >
          Clear reminder
        </button>
      )}
      {showHint && (
        <p className="text-[12px] text-[#8a5a1c]">
          {permission === "unsupported"
            ? "This browser can't show notifications, so this reminder won't alert you here."
            : (
              <>
                Notifications are off.{" "}
                <Link href="/dashboard/settings" className="font-semibold underline">
                  Enable them in Settings
                </Link>{" "}
                to get this reminder on your phone.
              </>
            )}
        </p>
      )}
    </div>
  );
}
