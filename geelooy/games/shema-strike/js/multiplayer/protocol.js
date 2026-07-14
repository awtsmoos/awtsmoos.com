//B"H
// Boruch Hashem
// Blessed is He
/**
 * Browser envelopes name Shema Strike without borrowing any older socket name.
 * The Awtsmoos renews request and answer; Awtsmoos.com preserves Eve and every
 * existing application while discovery, witness, combat, and return stay isolated.
 */

export const APPLICATION_ID = "shema-strike";
export const APPLICATION_VERSION = 1;
export const PROTOCOL_NAME = "awtsmoos.realtime";

export const MESSAGE_TYPES = Object.freeze({
	CREATE: "arena.create",
	DISCOVER: "arena.discover",
	INPUT: "arena.input",
	JOIN: "arena.join",
	LEAVE: "arena.leave",
	RECONNECT: "arena.reconnect",
	SNAPSHOT: "arena.snapshot",
	SPECTATE: "arena.spectate"
});

export const EVENT_TYPES = Object.freeze({
	CHANGED: "arena.changed",
	CLOSED: "arena.closed",
	STATE: "arena.state"
});

/** Creates one correlated, versioned request for the existing socket router. */
export function createRequest(type, payload, sequence) {
	return {
		application: APPLICATION_ID,
		payload,
		protocol: PROTOCOL_NAME,
		requestId: `shema-${Date.now()}-${sequence}`,
		sequence,
		type,
		version: APPLICATION_VERSION
	};
}

/** Resolves the same-origin public WebSocket doorway for local and HTTPS play. */
export function resolveSocketUrl(locationObject = globalThis.location) {
	const protocol = locationObject.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${locationObject.host}${locationObject.pathname || "/"}`;
}
