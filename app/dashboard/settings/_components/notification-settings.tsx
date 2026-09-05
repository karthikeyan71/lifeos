"use client";

import { useEffect, useState, useTransition } from "react";
import { savePushSubscription } from "@/features/reminders/actions/save-push-subscription";
import { deletePushSubscription } from "@/features/reminders/actions/delete-push-subscription";
import { saveTimezone } from "@/features/reminders/actions/save-timezone";
import { sendTestNotification } from "@/features/reminders/actions/send-test-notification";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

type Status = "loading" | "unsupported" | "not-configured" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

/** Reads the current push state for this browser. Does not touch React state. */
async function readStatus(pushConfigured: boolean): Promise<Status> {
  if (!pushConfigured || !VAPID_PUBLIC_KEY) return "not-configured";
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? "on" : "off";
  } catch {
    return "off";
  }
}

function syncTimezone(storedTimezone: string | null) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz && tz !== storedTimezone) void saveTimezone(tz);
}

export function NotificationSettings({
  pushConfigured,
  storedTimezone,
}: {
  pushConfigured: boolean;
  storedTimezone: string | null;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    readStatus(pushConfigured).then((next) => {
      if (!cancelled) setStatus(next);
    });
    syncTimezone(storedTimezone);
    return () => {
      cancelled = true;
    };
  }, [pushConfigured, storedTimezone]);

  async function enable() {
    setError("");
    setNotice("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const result = await savePushSubscription(subscription.toJSON());
      if (!result.success) {
        await subscription.unsubscribe().catch(() => {});
        setError(result.error ?? "Could not enable notifications");
        setStatus("off");
        return;
      }

      syncTimezone(storedTimezone);
      setStatus("on");
      setNotice("Notifications enabled on this device.");
    } catch {
      setError("Could not enable notifications on this device.");
      setStatus("off");
    }
  }

  async function disable() {
    setError("");
    setNotice("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe().catch(() => {});
      }
      setStatus("off");
      setNotice("Notifications turned off on this device.");
    } catch {
      setError("Could not turn off notifications.");
    }
  }

  function test() {
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await sendTestNotification();
      if (!result.success) {
        setError(result.error ?? "Could not send a test notification");
        return;
      }
      setNotice("Test notification sent.");
    });
  }

  return (
    <section className="rounded-xl border border-[#e7e5e4]/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[15px] font-semibold text-[#1c1917]">Reminder notifications</h2>
        <p className="text-[13px] leading-[19px] text-[#605e5a]">
          When a task, goal, or habit reminder time arrives, LifeOS sends a push notification to the
          devices you enable here.
        </p>
      </div>

      <div className="mt-4">
        {status === "loading" && <p className="text-[13px] text-[#605e5a]">Checking this device…</p>}

        {status === "not-configured" && (
          <p className="text-[13px] text-[#8a5a1c]">
            Push notifications aren&apos;t configured on this server yet. Set the VAPID environment
            variables to turn this on.
          </p>
        )}

        {status === "unsupported" && (
          <p className="text-[13px] text-[#8a5a1c]">
            This browser can&apos;t receive push notifications. Install LifeOS to your home screen
            (see below), or use a different browser.
          </p>
        )}

        {status === "denied" && (
          <p className="text-[13px] text-[#8a5a1c]">
            Notifications are blocked for this site in your browser settings. Allow them there, then
            reload this page.
          </p>
        )}

        {status === "off" && (
          <button
            type="button"
            onClick={enable}
            className="flex h-10 items-center justify-center rounded-lg bg-[#2c423b] px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Enable on this device
          </button>
        )}

        {status === "on" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#cfe8de]/60 px-3 py-1 text-[12px] font-semibold text-[#162c26]">
              Enabled on this device
            </span>
            <button
              type="button"
              onClick={test}
              disabled={isPending}
              className="flex h-9 items-center justify-center rounded-lg border border-[#c2c8c4]/60 px-4 text-[12px] font-medium text-[#424845] hover:bg-[#f4f3f1] disabled:opacity-50"
            >
              {isPending ? "Sending…" : "Send test"}
            </button>
            <button
              type="button"
              onClick={disable}
              className="flex h-9 items-center justify-center rounded-lg px-4 text-[12px] font-medium text-[#b3462c] hover:bg-[#ffdad6]/30"
            >
              Turn off
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-[12px] font-medium text-[#ba1a1a]">{error}</p>}
      {notice && <p className="mt-3 text-[12px] font-medium text-[#2c423b]">{notice}</p>}
    </section>
  );
}
