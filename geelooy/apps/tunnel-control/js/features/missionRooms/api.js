//B"H
//Boruch Hashem
//Blessed is He

import { callFs } from "../../api/tunnel.js";
import { ROOM_PROTOCOL_VERSION } from "./transport/protocol.js";

export {
	discoverPayload,
	joinPayload,
	startPayload,
	statusPayload,
	timelinePayload
} from "./payloads.js";

/**
 * B"H
 *
 * Every route is a narrow vessel carrying intention toward a real tunnel. The
 * Awtsmoos creates caller, route, server, and response anew; Awtsmoos.com names
 * protocol and recovery state explicitly so transport never claims false power.
 */

/**
 * Sends one guarded Mission Rooms action through the selected native tunnel.
 *
 * @param {Function} getTunnelName
 * 	A function returning the selected tunnel identity.
 * @param {object} payload
 * 	The complete tunnel action payload to execute.
 * @returns {Promise<object>}
 * 	The successful response returned by the tunnel-control API.
 * @throws {Error}
 * 	Thrown when the tunnel returns an explicit failure response.
 */
export async function roomAction(getTunnelName, payload) {
	const response = await callFs(getTunnelName?.() || "auto", {
		p: ".",
		...payload
	});
	if (response.ok === false) {
		throw new Error(
			response.message
			|| response.error
			|| `${payload.action}_failed`
		);
	}
	return response;
}

/** Builds the versioned WebSocket URL for a selected mission room. */
export function roomSocketUrl(getTunnelName, missionId, resumeState = {}) {
	const origin = location.origin.replace(/^http/, "ws");
	const url = new URL("/api/tunnel/control/mission-room/ws", origin);
	appendRoomTransportQuery(url, getTunnelName, missionId, resumeState);
	return url.toString();
}

/** Builds the versioned EventSource fallback URL for a selected mission room. */
export function roomStreamUrl(getTunnelName, missionId, resumeState = {}) {
	const url = new URL(
		"/api/tunnel/control/mission-room/stream",
		location.origin
	);
	appendRoomTransportQuery(url, getTunnelName, missionId, resumeState);
	url.searchParams.set("pollMs", "2500");
	return url.toString();
}

function appendRoomTransportQuery(
	url,
	getTunnelName,
	missionId,
	resumeState
) {
	url.searchParams.set("tunnelName", getTunnelName?.() || "auto");
	url.searchParams.set("missionId", missionId || "");
	url.searchParams.set("protocolVersion", String(ROOM_PROTOCOL_VERSION));
	if (Number.isFinite(resumeState.lastSequence)) {
		url.searchParams.set(
			"lastSequence",
			String(resumeState.lastSequence)
		);
	}
	if (resumeState.resumeToken) {
		url.searchParams.set("resumeToken", resumeState.resumeToken);
	}
}
