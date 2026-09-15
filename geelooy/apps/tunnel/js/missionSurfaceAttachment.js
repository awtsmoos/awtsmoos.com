//B"H
// Boruch Hashem
// Blessed is He

import { createMissionSurfaceClient } from "./missionSurfaceClient.js";

const HEARTBEAT_MS = 20000;

/**
 * @file Attaches the regular browser Tunnel to the same authoritative Mission lifecycle as OS.
 * @description The Awtsmoos lets each browser tab become a living incarnation while Mission,
 * Room, Work, Context and continuation remain native Tunnel truth rather than browser-local state.
 */
export async function attachMissionSurface(host, options = {}) {
	detachMissionSurface(host);
	const client = createMissionSurfaceClient({ ...options, tunnelName: options.tunnelName || "auto" });
	if (!client.identity.missionParticipant) {
		host.missionSurface = { attached: false, client };
		return host.missionSurface;
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
	host.missionSurface = state;
	await refresh(state);
	state.timer = setInterval(() => refresh(state).catch(error => {
		state.lastError = error?.message || String(error);
	}), HEARTBEAT_MS);
	return state;
}

export function detachMissionSurface(host) {
	const state = host?.missionSurface;
	if (state?.timer) clearInterval(state.timer);
	if (host) host.missionSurface = null;
}

async function refresh(state) {
	const [heartbeat, continuation] = await Promise.allSettled([
		state.client.heartbeat({ status: "active", currentWork: "browser Tunnel surface" }),
		state.client.continuationStatus({})
	]);
	if (heartbeat.status === "fulfilled") state.lastHeartbeat = heartbeat.value;
	if (continuation.status === "fulfilled") state.lastContinuation = continuation.value;
	const rejected = [heartbeat, continuation].find(item => item.status === "rejected");
	state.lastError = rejected?.reason?.message || "";
	return state;
}

export { HEARTBEAT_MS };
