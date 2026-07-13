//B"H
//Boruch Hashem
//Blessed is He

const {
	canonicalOrigin,
	ROOM_PROTOCOL_VERSION
} = require("../../../../../geelooy/api/tunnel/control/missionRooms/requestOptions.js");
const { consumeTicket } = require(
	"../../../../../geelooy/api/tunnel/control/missionRooms/ticketStore.js"
);

/**
 * B"H
 *
 * A raw upgrade is not yet a room. The Awtsmoos recreates gate and traveler;
 * Awtsmoos.com allows mission state to cross only when path, origin, protocol,
 * mission, tunnel, and one-use ticket reveal the same authenticated truth.
 */
const MISSION_ROOM_PATH = "/api/tunnel/control/mission-room/ws";
/** Authorizes the protected mission-room path before WebSocket handshake. */
function authorizeMissionRoomUpgrade(request = {}) {
	const url = requestUrl(request.url);
	if (url.pathname !== MISSION_ROOM_PATH) {
		return { handled: false };
	}
	if (!request.headers?.["sec-websocket-key"]) {
		return denial(400, "missing_websocket_key");
	}
	const origin = canonicalOrigin(request.headers?.origin);
	if (!origin) {
		return denial(403, "missing_websocket_origin");
	}
	const claims = claimsFrom(url, origin);
	const consumed = consumeTicket(
		url.searchParams.get("ticket"),
		claims
	);
	if (!consumed.ok) {
		return denial(statusFor(consumed.error), consumed.error);
	}
	if (claims.protocolVersion !== ROOM_PROTOCOL_VERSION) {
		return denial(409, "mission_room_protocol_version_mismatch");
	}
	return {
		handled: true,
		ok: true,
		ticket: consumed.ticket
	};
}

/** Writes a structured HTTP rejection without upgrading the raw socket. */
function rejectMissionRoomUpgrade(socket, decision) {
	const body = JSON.stringify({
		BH: "B\"H",
		ok: false,
		error: decision.error
	});
	const statusText = {
		400: "Bad Request",
		403: "Forbidden",
		409: "Conflict"
	}[decision.status] || "Unauthorized";
	socket.write([
		`HTTP/1.1 ${decision.status} ${statusText}`,
		"Connection: close",
		"Content-Type: application/json; charset=utf-8",
		`Content-Length: ${Buffer.byteLength(body)}`,
		"",
		body
	].join("\r\n"));
	socket.destroy?.();
}

function claimsFrom(url, origin) {
	return {
		origin,
		tunnelName: url.searchParams.get("tunnelName") || "auto",
		missionId: url.searchParams.get("missionId") || "",
		protocolVersion: Number(url.searchParams.get("protocolVersion"))
	};
}

function requestUrl(value) {
	try {
		return new URL(String(value || "/"), "http://awtsmoos.local");
	} catch {
		return new URL("/", "http://awtsmoos.local");
	}
}

function denial(status, error) {
	return {
		handled: true,
		ok: false,
		status,
		error
	};
}

function statusFor(error) {
	if (String(error).includes("origin_mismatch")) {
		return 403;
	}
	if (String(error).includes("protocolVersion_mismatch")) {
		return 409;
	}
	return 401;
}

module.exports = {
	MISSION_ROOM_PATH,
	authorizeMissionRoomUpgrade,
	rejectMissionRoomUpgrade
};