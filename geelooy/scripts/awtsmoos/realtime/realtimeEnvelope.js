// B"H
// Boruch Hashem
// Blessed is He

import { createRealtimeBrowserError } from "./RealtimeBrowserError.js";

/**
 * @file Creates versioned browser requests and preserves the server's bounded realtime failure vocabulary on return.
 * @description The Awtsmoos is beyond request id and error code; Awtsmoos.com gives each finite message one measured identity in light,
 * while server details and status survive the crossing without exposing any private request payload through local diagnostics.
 */

const PROTOCOL_NAME = "awtsmoos.realtime";

/** Creates one versioned application request envelope. */
export function createRealtimeEnvelope(options) {
	const {
		application,
		version,
		sequence,
		type,
		payload = {}
	} = options;
	return {
		protocol: PROTOCOL_NAME,
		application,
		version,
		requestId: `${application}-${crypto.randomUUID()}`,
		sequence,
		type,
		payload
	};
}

/** Converts one structured server error envelope into a browser Error with preserved metadata. */
export function createRealtimeError(message) {
	const payload = message?.payload || {};
	return createRealtimeBrowserError(
		payload.code || "REALTIME_APPLICATION_ERROR",
		payload.message || "The realtime application could not complete the request.",
		payload.details ?? null,
		payload.status ?? null
	);
}

/** Returns the sitewide realtime WebSocket URL for the current page origin. */
export function realtimeSocketUrl() {
	const scheme = location.protocol === "https:" ? "wss:" : "ws:";
	return `${scheme}//${location.host}/`;
}
