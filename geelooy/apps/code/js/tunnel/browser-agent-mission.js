//B"H
// Boruch Hashem
// Blessed is He

import { createMissionSurfaceClient } from "./mission-surface-client.js";

const HEARTBEAT_MS = 20000;

/**
 * @file Attaches an /apps/code browser tab to the authoritative Tunnel Mission lifecycle.
 * @description The Awtsmoos lets the Code surface become a living Mission incarnation without
 * owning Mission truth; heartbeats, Room, Work, Context and continuation all route to native authority.
 */
export async function attachBrowserMission(agent, options = {}) {
	detachBrowserMission(agent);
	const client = createMissionSurfaceClient({ ...options, tunnelName: options.tunnelName || "auto" });
	if (!client.identity.missionParticipant) {
		agent.missionSurface = { attached: false, client };
		return agent.missionSurface;
	}
	const state = {
		attached: true,
		client,
		identity: client.identity,
		lastHeartbeat: null,
		lastContinuation: null,
		lastError: "",
		timer: null
	};
	agent.missionSurface = state;
	await refresh(state);
	state.timer = setInterval(() => refresh(state).catch(error => {
		state.lastError = error?.message || String(error);
	}), HEARTBEAT_MS);
	return state;
}

export function detachBrowserMission(agent) {
	const state = agent?.missionSurface;
	if (state?.timer) clearInterval(state.timer);
	if (agent) agent.missionSurface = null;
}

async function refresh(state) {
	const [heartbeat, continuation] = await Promise.allSettled([
		state.client.heartbeat({ status: "active", currentWork: "apps/code browser surface" }),
		state.client.continuationStatus({})
	]);
	if (heartbeat.status === "fulfilled") state.lastHeartbeat = heartbeat.value;
	if (continuation.status === "fulfilled") state.lastContinuation = continuation.value;
	const rejected = [heartbeat, continuation].find(item => item.status === "rejected");
	state.lastError = rejected?.reason?.message || "";
	return state;
}

export { HEARTBEAT_MS };
