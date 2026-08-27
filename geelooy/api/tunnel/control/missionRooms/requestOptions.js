//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A query is only a passing garment around intent. The Awtsmoos recreates
 * request, proxy, browser, and server each instant; Awtsmoos.com therefore
 * normalizes every mission-room boundary before authority may flow through it.
 */

const ROOM_PROTOCOL_VERSION = 1;

/**
 * Parses bounded mission-room values from the active route context.
 *
 * @param {object} context
 * 	The Awtsmoos dynamic-route context.
 * @returns {object}
 * 	Normalized mission, transport, scope, and reconnect values.
 */
function parseMissionRoomOptions(context = {}) {
	const parameters = {
		...(context.paramKinds?.GET || {}),
		...(context.paramKinds?.POST || {})
	};

	return {
		tunnelName: text(parameters.tunnelName || parameters.tunnel || "auto", 160),
		missionId: text(parameters.missionId || parameters.room, 240),
		conversationId: text(parameters.conversationId, 240),
		conversationName: text(parameters.conversationName, 240),
		agentSessionId: text(parameters.agentSessionId, 240),
		logicalAgentId: text(parameters.logicalAgentId, 240),
		clientRequestId: text(parameters.clientRequestId, 240),
		mode: text(parameters.mode, 80),
		protocolVersion: integer(parameters.protocolVersion, ROOM_PROTOCOL_VERSION, 0, 100),
		lastSequence: integer(parameters.lastSequence, 0, 0, 1000000000),
		resumeToken: text(parameters.resumeToken, 512),
		pollMs: integer(parameters.pollMs, 2500, 700, 30000),
		historyLimit: integer(parameters.historyLimit || parameters.limit, 120, 10, 500),
		origin: requestOrigin(context)
	};
}

/**
 * Resolves the browser-facing origin through trusted request headers.
 *
 * @param {object} context
 * 	The active route context.
 * @returns {string}
 * 	A canonical origin or an empty string when none can be proven.
 */
function requestOrigin(context = {}) {
	const request = context.request || context.req || {};
	const headers = request.headers || {};
	const declaredOrigin = canonicalOrigin(headers.origin);

	if (declaredOrigin) {
		return declaredOrigin;
	}

	const protocol = firstHeader(headers["x-forwarded-proto"])
		|| (request.socket?.encrypted ? "https" : "http");
	const host = firstHeader(headers["x-forwarded-host"])
		|| firstHeader(headers.host);

	return host ? canonicalOrigin(`${protocol}://${host}`) : "";
}

function canonicalOrigin(value) {
	try {
		return value ? new URL(String(value)).origin : "";
	} catch {
		return "";
	}
}

function firstHeader(value) {
	return String(Array.isArray(value) ? value[0] : value || "")
		.split(",")[0]
		.trim();
}

function text(value, maximumLength) {
	return String(value || "").trim().slice(0, maximumLength);
}

function integer(value, fallback, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(Math.floor(number), maximum));
}

module.exports = {
	ROOM_PROTOCOL_VERSION,
	canonicalOrigin,
	parseMissionRoomOptions,
	requestOrigin
};
