"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function noopSubscribe() {
  return () => {};
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STANDALONE_QUERY = "(display-mode: standalone)";

function subscribeDisplayMode(onChange: () => void) {
  const media = window.matchMedia(STANDALONE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isStandalone(): boolean {
  return (
    window.matchMedia(STANDALONE_QUERY).matches ||
    // iOS Safari uses a non-standard flag.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as a Mac; disambiguate by touch support.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function PwaInstall() {
  const installed = useSyncExternalStore(subscribeDisplayMode, isStandalone, () => false);
  const ios = useSyncExternalStore(noopSubscribe, isIos, () => false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [outcome, setOutcome] = useState<"accepted" | "dismissed" | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setOutcome("accepted");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setOutcome(choice.outcome);
    if (choice.outcome === "accepted") setDeferredPrompt(null);
  }

  return (
    <section className="rounded-xl border border-[#e7e5e4]/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[15px] font-semibold text-[#1c1917]">Install the app</h2>
        <p className="text-[13px] leading-[19px] text-[#605e5a]">
          Installing LifeOS gives it its own icon, a full-screen window, and more reliable
          notification delivery on mobile.
        </p>
      </div>

      <div className="mt-4">
        {installed ? (
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-[#cfe8de]/60 px-3 py-1 text-[12px] font-semibold text-[#162c26]">
            LifeOS is installed on this device
          </span>
        ) : deferredPrompt ? (
          <button
            type="button"
            onClick={install}
            className="flex h-10 items-center justify-center rounded-lg bg-[#2c423b] px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Install LifeOS
          </button>
        ) : ios ? (
          <ol className="flex flex-col gap-1.5 text-[13px] leading-[19px] text-[#424845]">
            <li>1. Tap the Share button in Safari&apos;s toolbar.</li>
            <li>
              2. Choose <span className="font-semibold">Add to Home Screen</span>.
            </li>
            <li>3. Tap Add. LifeOS then opens like an app.</li>
          </ol>
        ) : (
          <p className="text-[13px] leading-[19px] text-[#424845]">
            Open your browser&apos;s menu and choose{" "}
            <span className="font-semibold">Install app</span> or{" "}
            <span className="font-semibold">Add to Home Screen</span>. If you don&apos;t see it, the
            app may already be installed, or your browser doesn&apos;t support installation.
          </p>
        )}

        {outcome === "dismissed" && (
          <p className="mt-3 text-[12px] font-medium text-[#8a5a1c]">
            Installation dismissed. You can run it again anytime from here.
          </p>
        )}
      </div>
    </section>
  );
}
