"use client";

import { useEffect } from "react";

/**
 * Registers the service worker once, on the client, after load. Rendered from
 * the root layout. Registration failures are non-fatal — the app works without
 * it, just without offline shell caching or push delivery.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore — SW is a progressive enhancement.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
