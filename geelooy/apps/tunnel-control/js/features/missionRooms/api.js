// B"H

import { callFs } from "../../api/tunnel.js";

/** B"H: Mission Rooms uses the same guarded tunnel API as Control. */
export async function roomAction(getTunnelName, payload) {
	const got = await callFs(getTunnelName?.() || "auto", { p: ".", ...payload });
	if (got.ok === false) throw new Error(got.message || got.error || `${payload.action}_failed`);
	return got;
}

export function roomSocketUrl(getTunnelName, missionId) {
	const url = new URL("/api/tunnel/control/mission-room/ws", location.origin.replace(/^http/, "ws"));
	url.searchParams.set("tunnelName", getTunnelName?.() || "auto");
	url.searchParams.set("missionId", missionId || "");
	return url.toString();
}

export function roomStreamUrl(getTunnelName, missionId) {
	const url = new URL("/api/tunnel/control/mission-room/stream", location.origin);
	url.searchParams.set("tunnelName", getTunnelName?.() || "auto");
	url.searchParams.set("missionId", missionId || "");
	url.searchParams.set("pollMs", "2500");
	return url.toString();
}

export function discoverPayload(projectRoot, agentId) {
	return {
		action: "missionProjectDiscover",
		targetVessel: "native-tunnel",
		projectRoot,
		q: projectRoot || "",
		agentId,
		limit: 80
	};
}

export function startPayload(goal, projectRoot, agentId) {
	return {
		action: "missionStart",
		targetVessel: "native-tunnel",
		goal: goal || "New mission room",
		projectRoot,
		agentId,
		expand: false,
		minimumInnovationWindowMs: 0,
		minimumProductiveCycles: 0,
		minimumProductiveMs: 0
	};
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
