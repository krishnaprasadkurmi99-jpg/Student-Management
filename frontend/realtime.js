import { createRealtimeClient } from "@neon/realtime/client";

const status = document.querySelector("#realtime-status");
let realtimeClient;
let subscription;
let renewalTimer;
let lastTotal;

async function fetchSealedQuery() {
  const response = await fetch("/api/neon/realtime-query", { credentials: "same-origin" });
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("Sign in to connect live updates.");
  }
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Could not connect live dashboard updates.");
  }
  return payload;
}

function scheduleRenewal(sealedQuery) {
  clearTimeout(renewalTimer);
  renewalTimer = setTimeout(async () => {
    let next;
    try {
      next = await fetchSealedQuery();
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `${error.message} Retrying…`;
      renewalTimer = setTimeout(() => scheduleRenewal(sealedQuery), 1000);
      return;
    }
    try {
      await subscription.renew(next.sealed_query);
      scheduleRenewal(next.sealed_query);
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `Live updates stopped: ${error.message}`;
      clearTimeout(renewalTimer);
    }
  }, Math.max(0, sealedQuery.expiresAt - Date.now() - 10_000));
}

async function connectLiveDashboard() {
  const initial = await fetchSealedQuery();
  realtimeClient = createRealtimeClient({ url: initial.realtime_url });
  subscription = realtimeClient.subscribe(initial.sealed_query);
  subscription.onChange(({ data, status: state, error }) => {
    if (state === "error") {
      status.dataset.state = "error";
      status.textContent = `Live updates stopped: ${error.message}`;
      clearTimeout(renewalTimer);
      return;
    }
    status.dataset.state = state === "live" ? "live" : "";
    status.textContent = state === "live" ? "Live dashboard updates connected" : "Connecting live updates…";
    const total = data?.[0]?.total;
    if (typeof total === "number") {
      if (lastTotal !== undefined && total !== lastTotal) {
        window.dispatchEvent(new Event("campusly:realtime-update"));
      }
      lastTotal = total;
    }
  });
  scheduleRenewal(initial.sealed_query);
  window.addEventListener("pagehide", () => {
    clearTimeout(renewalTimer);
    subscription.unsubscribe();
    realtimeClient.close();
  }, { once: true });
}

connectLiveDashboard().catch((error) => {
  status.dataset.state = "error";
  status.textContent = `Live updates unavailable: ${error.message}`;
});
