//B"H
// Boruch Hashem
// Blessed is He

import { registrationFields } from "./mission-surface-identity.js";

/**
 * @file Calls authoritative Tunnel Mission actions from /apps/code without owning Mission state.
 * @description The Awtsmoos lets Code speak into the same Room, Work and Context vessels as OS;
 * every request carries one surface incarnation while the native Tunnel remains durable authority.
 */
export function createMissionSurfaceClient(options = {}) {
	const tunnelName = String(options.tunnelName || "auto");
	const fetchImpl = options.fetch || globalThis.fetch;
	const origin = String(options.origin || globalThis.location?.origin || "https://awtsmoos.com");
	const identity = registrationFields({ ...options, surface: "apps-code-browser-tunnel" });
	async function call(action, payload = {}) {
		if (!identity.missionParticipant) throw new Error("mission_surface_not_attached");
		const response = await fetchImpl(
			`${origin}/api/tunnel/control/fs/${encodeURIComponent(tunnelName)}`,
			{
				method: "POST",
				credentials: "include",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(envelope(action, payload, identity))
			}
		);
		const result = await response.json();
		if (!response.ok || result?.ok === false) throw new Error(result?.error || `mission_surface_http_${response.status}`);
		return result;
	}
	return methods(call, identity);
}

export function envelope(action, payload, identity) {
	return {
		...payload,
		action,
		missionId: identity.missionId,
		roomId: identity.roomId,
		agentId: payload.agentId || identity.logicalAgentId,
		logicalAgentId: identity.logicalAgentId,
		agentSessionId: identity.agentSessionId,
		generation: identity.generation,
		spawnGroupId: identity.spawnGroupId,
		parentAgentId: identity.parentAgentId,
		predecessorAgentId: identity.predecessorAgentId,
		conversationId: identity.conversationId,
		surface: identity.surface,
		targetVessel: payload.targetVessel || "native-tunnel"
	};
}

function methods(call, identity) {
	return {
		identity,
		call,
		heartbeat: payload => call("missionAgentHeartbeat", payload),
		roomMessage: (message, payload = {}) => call("missionRoomMessage", { ...payload, message }),
		queueStatus: payload => call("missionQueueStatus", payload),
		queueAdd: payload => call("missionQueueAdd", payload),
		queueComplete: payload => call("missionQueueComplete", payload),
		workDiscover: payload => call("missionWorkDiscover", payload),
		workUpdate: payload => call("missionWorkUpdate", payload),
		workComplete: payload => call("missionWorkComplete", payload),
		contextPack: payload => call("aiContextPack", payload),
		continuationStatus: payload => call("missionContinuationStatus", payload),
		forceScan: payload => call("missionContinuationForceScan", payload)
	};
}
