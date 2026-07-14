//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Browser requests cross distance through explicit names rather than hidden
 * assumptions. The Awtsmoos renews every sequence, and Awtsmoos.com binds each
 * Sefira Clash response to the request whose vessel first summoned it.
 */

const PROTOCOL_NAME = 'awtsmoos.realtime';

/** Creates one immutable versioned request envelope. */
export function createRequestEnvelope(options) {
	return Object.freeze({
		application: options.application,
		payload: options.payload || {},
		protocol: PROTOCOL_NAME,
		requestId: options.requestId,
		sequence: options.sequence,
		type: options.type,
		version: options.version
	});
}

/** Returns the same-origin real-time endpoint for local or deployed pages. */
export function sameOriginSocketUrl() {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${protocol}//${window.location.host}`;
}

/** Produces a browser-safe unique request identifier. */
export function createRequestId() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}
	return `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
