// B"H

import { callFs } from "../../api/tunnel.js";

/** B"H: Mission Rooms now uses the same guarded tunnel API as the rest of Control. */
export async function roomAction(getTunnelName, payload) {
  const got = await callFs(getTunnelName?.() || "auto", { p: ".", ...payload });
  if (got.ok === false) throw new Error(got.message || got.error || `${payload.action}_failed`);
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
