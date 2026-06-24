// B"H

import { getJson } from "../../api/http.js";

/**
 * B"H
 * Chapter 702: A room action became one honest URL.
 *
 * Every room breath crosses the same tunnel bridge; this file keeps that bridge
 * small, visible, and measurable.
 */
export async function roomAction(getTunnelName, payload) {
  const tunnel = encodeURIComponent(getTunnelName?.() || "auto");
  const url = new URL(`/api/tunnel/control/fs/${tunnel}`, location.origin);
  for (const [key, value] of Object.entries(payload || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const got = await getJson(url.toString(), { credentials: "include" });
  if (got.ok === false) throw new Error(got.error || `${payload.action}_failed`);
  return got;
}

export function discoverPayload(projectRoot, agentId) {
  return {
    action: "missionProjectDiscover",
    targetVessel: "native-tunnel",
    projectRoot,
    q: projectRoot || "",
    agentId,
    limit: 40
  };
}

export function heartbeatPayload(missionId, agentId, note = "control-room refresh") {
  return {
    action: "missionAgentHeartbeat",
    targetVessel: "native-tunnel",
    missionId,
    agentId,
    status: "observing",
    currentAction: "mission-room-watch",
    note
  };
}
