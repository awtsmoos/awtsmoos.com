// B"H

import { getJson } from "../../api/http.js";

/**
 * B"H
 * Chapter 716: The room asks only for rooms and room-scoped tool fire.
 *
 * Global tool codex belongs to the Tool Codex page. Mission Rooms now asks the
 * bridge for rooms, room status, room messages, and live calls filtered to the
 * selected chamber so the human sees what this room is doing to the tunnel.
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

export async function liveCalls(filter = "") {
  const url = new URL("/api/tunnel/control/live-calls", location.origin);
  url.searchParams.set("groupBy", "conversation");
  url.searchParams.set("limit", "120");
  if (filter) url.searchParams.set("filter", filter);
  const got = await getJson(url.toString(), { credentials: "include" });
  if (got.ok === false) throw new Error(got.error || "live_calls_failed");
  return got;
}

export function discoverPayload(projectRoot, agentId) {
  return { action: "missionProjectDiscover", targetVessel: "native-tunnel", projectRoot, q: projectRoot || "", agentId, limit: 80 };
}

export function joinPayload(missionId) {
  return { action: "missionProjectJoin", targetVessel: "native-tunnel", missionId };
}

export function statusPayload(missionId) {
  return { action: "missionProjectStatus", targetVessel: "native-tunnel", missionId };
}

export function heartbeatPayload(missionId, agentId, note = "control-room refresh") {
  return { action: "missionAgentHeartbeat", targetVessel: "native-tunnel", missionId, agentId, status: "observing", currentAction: "mission-room-watch", note };
}
