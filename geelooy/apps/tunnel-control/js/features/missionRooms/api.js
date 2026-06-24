// B"H

import { getJson } from "../../api/http.js";

/**
 * B"H
 * Chapter 709: The room bridge learned the whole tool alphabet.
 *
 * The Awtsmoos does not let Mission Rooms guess what the tunnel can do. The
 * room asks the same docs route that feeds agents, then displays every action
 * as a visible instrument in the mission chamber.
 */
export async function roomAction(getTunnelName, payload) {
  const tunnel = encodeURIComponent(getTunnelName?.() || "auto");
  const url = new URL(`/api/tunnel/control/fs/${tunnel}`, location.origin);
  for (const [key, value] of Object.entries(payload || {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const got = await getJson(url.toString(), { credentials: "include" });
  if (got.ok === false) throw new Error(got.error || `${payload.action}_failed`);
  return got;
}

export async function docsCatalog() {
  const got = await getJson(new URL("/api/tunnel/control/docs.json", location.origin).toString(), { credentials: "include" });
  if (got.ok === false) throw new Error(got.error || "docs_catalog_failed");
  return got;
}

export async function liveCalls(filter = "") {
  const url = new URL("/api/tunnel/control/live-calls", location.origin);
  url.searchParams.set("groupBy", "conversation");
  url.searchParams.set("limit", "200");
  if (filter) url.searchParams.set("filter", filter);
  const got = await getJson(url.toString(), { credentials: "include" });
  if (got.ok === false) throw new Error(got.error || "live_calls_failed");
  return got;
}

export function discoverPayload(projectRoot, agentId) {
  return { action: "missionProjectDiscover", targetVessel: "native-tunnel", projectRoot, q: projectRoot || "", agentId, limit: 40 };
}

export function heartbeatPayload(missionId, agentId, note = "control-room refresh") {
  return { action: "missionAgentHeartbeat", targetVessel: "native-tunnel", missionId, agentId, status: "observing", currentAction: "mission-room-watch", note };
}
