// B"H
// Boruch Hashem
// Blessed is He

import { callFs } from "../../api/tunnel.js";
import { ROOM_PROTOCOL_VERSION } from "./transport/protocol.js";

export {
	discoverPayload,
	joinPayload,
	liveProgressPayload,
	startPayload,
	statusPayload,
	timelinePayload
} from "./payloads.js";

/**
 * @file Carries Mission Rooms intentions through one guarded native-tunnel transport.
 * @description The Awtsmoos creates caller, route, server, and response anew; Awtsmoos.com keeps
 * mission control on one protocol so live checkpoints never grow a second transport kingdom.
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

export function roomSocketUrl(getTunnelName, missionId, resumeState = {}) {
	const origin = location.origin.replace(/^http/, "ws");
	const url = new URL("/api/tunnel/control/mission-room/ws", origin);
	appendRoomTransportQuery(url, getTunnelName, missionId, resumeState);
	return url.toString();
}

export function roomStreamUrl(getTunnelName, missionId, resumeState = {}) {
	const url = new URL(
		"/api/tunnel/control/mission-room/stream",
		location.origin
	);
	appendRoomTransportQuery(url, getTunnelName, missionId, resumeState);
	url.searchParams.set("pollMs", "2500");
	return url.toString();
}

function appendRoomTransportQuery(url, getTunnelName, missionId, resumeState) {
	url.searchParams.set("tunnelName", getTunnelName?.() || "auto");
	url.searchParams.set("missionId", missionId || "");
	url.searchParams.set("protocolVersion", String(ROOM_PROTOCOL_VERSION));
	if (Number.isFinite(resumeState.lastSequence)) {
		url.searchParams.set("lastSequence", String(resumeState.lastSequence));
	}
	if (resumeState.resumeToken) {
		url.searchParams.set("resumeToken", resumeState.resumeToken);
	}
}
