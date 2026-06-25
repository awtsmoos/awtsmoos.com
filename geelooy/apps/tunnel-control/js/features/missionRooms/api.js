// B"H

import { getJson } from "../../api/http.js";

/** B"H: Mission Rooms talks only to mission room endpoints. */
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

/** B"H: WebSocket-first room stream URL, scoped by tunnel and mission id. */
export function roomSocketUrl(getTunnelName, missionId) {
  const url = new URL("/api/tunnel/control/mission-room/ws", location.origin.replace(/^http/, "ws"));
  url.searchParams.set("tunnelName", getTunnelName?.() || "auto");
  url.searchParams.set("missionId", missionId || "");
  return url.toString();
}

export function discoverPayload(projectRoot, agentId) {
  return { action: "missionProjectDiscover", targetVessel: "native-tunnel", projectRoot, q: projectRoot || "", agentId, limit: 80 };
}

export function joinPayload(missionId, input = {}) {
  return { action: "missionProjectJoin", targetVessel: "native-tunnel", missionId, ...input };
}

export function statusPayload(missionId) {
  return { action: "missionProjectStatus", targetVessel: "native-tunnel", missionId };
}

export function timelinePayload(missionId) {
  return { action: "missionTimeline", targetVessel: "native-tunnel", missionId };
}
