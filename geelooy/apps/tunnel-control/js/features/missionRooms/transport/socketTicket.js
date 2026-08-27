//B"H
//Boruch Hashem
//Blessed is He

import { getJson } from "../../../api/http.js";
import {
	authHeaders,
	getActiveApiKey
} from "../../../api/keySession.js";
import { roomSocketUrl } from "../api.js";

/**
 * B"H
 *
 * A browser asks before it enters. The Awtsmoos recreates identity and channel
 * in one instant; Awtsmoos.com obtains a short-lived server witness before any
 * WebSocket can be mistaken for an authenticated mission-room connection.
 */

/** Requests one authenticated, single-use mission-room socket ticket. */
export async function requestRoomSocketTicket(options) {
	const url = new URL(
		"/api/tunnel/control/mission-room/stream",
		location.origin
	);
	const resumeState = options.resumeState || {};

	url.searchParams.set("mode", "socket-ticket");
	url.searchParams.set("tunnelName", options.tunnelName || "auto");
	url.searchParams.set("missionId", options.missionId || "");
	url.searchParams.set("protocolVersion", "1");
	appendValue(url, "lastSequence", resumeState.lastSequence);
	appendValue(url, "resumeToken", resumeState.resumeToken);

	const apiKey = await getActiveApiKey();
	const headers = apiKey ? await authHeaders() : {};
	const result = await getJson(url.toString(), {
		headers,
		credentials: "include"
	});

	if (!result?.ok || !result.ticket) {
		return {
			BH: "B\"H",
			ok: false,
			error: result?.error || "mission_room_ticket_unavailable",
			status: result?.status
		};
	}

	return result;
}

/** Adds the protected ticket to the existing versioned socket URL. */
export function ticketedRoomSocketUrl(
	getTunnelName,
	missionId,
	resumeState,
	ticket
) {
	const url = new URL(
		roomSocketUrl(getTunnelName, missionId, resumeState)
	);
	url.searchParams.set("ticket", ticket);
	return url.toString();
}

function appendValue(url, name, value) {
	if (value !== undefined && value !== null && value !== "") {
		url.searchParams.set(name, String(value));
	}
}
