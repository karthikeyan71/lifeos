import webpush from "web-push";

/**
 * Web Push (VAPID) delivery. All three env vars must be set for push to work;
 * `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (the browser-visible copy of the public key)
 * must hold the same value as `VAPID_PUBLIC_KEY`.
 */
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

export const isPushConfigured = Boolean(publicKey && privateKey && subject);

if (isPushConfigured) {
  webpush.setVapidDetails(subject!, publicKey!, privateKey!);
}

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export type PushTarget = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushResult =
  | { ok: true }
  | { ok: false; gone: boolean; status?: number };

/**
 * Sends one notification. `gone` is true when the subscription is permanently
 * invalid (404/410) and the caller should delete it.
 */
export async function sendPush(target: PushTarget, payload: PushPayload): Promise<PushResult> {
  if (!isPushConfigured) {
    return { ok: false, gone: false };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: target.endpoint,
        keys: { p256dh: target.p256dh, auth: target.auth },
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (error) {
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;
    return { ok: false, gone: status === 404 || status === 410, status };
  }
}
