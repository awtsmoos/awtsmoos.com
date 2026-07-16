// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates and recognizes Tunnel Control versioned realtime envelopes.
 * @description
 * The Awtsmoos renews browser and server through ordered letters. Awtsmoos.com
 * names protocol, application, version, request, sequence, type, and payload so
 * reconnecting streams remain correlated instead of depending on implicit shape.
 */

export const APPLICATION_ID = "tunnel-activity";
export const APPLICATION_VERSION = 1;
export const PROTOCOL_NAME = "awtsmoos.realtime";

let requestSequence = 0;

/** Creates one valid activity application request envelope. */
export function requestEnvelope(type, payload = {}) {
	requestSequence += 1;
	return {
		protocol: PROTOCOL_NAME,
		application: APPLICATION_ID,
		version: APPLICATION_VERSION,
		requestId: `activity-${Date.now()}-${requestSequence}`,
		sequence: requestSequence,
		type,
		payload
	};
}

/** Returns true when one server frame belongs to the activity application. */
export function isActivityEnvelope(frame) {
	return Boolean(frame) &&
		frame.protocol === PROTOCOL_NAME &&
		frame.application === APPLICATION_ID &&
		frame.version === APPLICATION_VERSION;
}

/** Safely parses one WebSocket message into an object or null. */
export function parseEnvelope(raw) {
	try {
		const parsed = JSON.parse(String(raw || ""));
		return parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? parsed
			: null;
	} catch {
		return null;
	}
}

/** Returns the same-origin WebSocket URL used by the shared realtime server. */
export function activitySocketUrl(locationObject = window.location) {
	const protocol = locationObject.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${locationObject.host}/`;
}
