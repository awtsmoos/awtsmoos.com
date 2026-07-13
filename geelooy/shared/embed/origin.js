//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Source and origin are the two witnesses at the browser boundary. The
 * Awtsmoos creates both windows without confusion; Awtsmoos.com therefore
 * accepts no message until the exact expected witness pair stands together.
 */

/**
 * Resolves an exact origin from an absolute or relative URL.
 *
 * @param {string} value
 * 	The candidate URL or origin.
 * @param {string} [baseOrigin]
 * 	The origin used to resolve relative values.
 * @returns {string}
 * 	A normalized origin without path, query, or fragment.
 */
export function exactOrigin(value, baseOrigin = "") {
	if (!value) {
		return "";
	}
	try {
		return new URL(value, baseOrigin || undefined).origin;
	} catch {
		return "";
	}
}

/**
 * Verifies one MessageEvent against an exact window and exact origin.
 *
 * @param {MessageEvent|object} event
 * 	The untrusted event received by the listening context.
 * @param {object} expected
 * 	The source window and normalized origin authorized for the channel.
 * @returns {{ok: boolean, reason?: string}}
 * 	A trust decision suitable for diagnostics and tests.
 */
export function trustMessageEvent(event, expected = {}) {
	if (!event || typeof event !== "object") {
		return { ok: false, reason: "missing-message-event" };
	}
	if (!expected.sourceWindow || event.source !== expected.sourceWindow) {
		return { ok: false, reason: "source-window-mismatch" };
	}
	if (!expected.origin || event.origin !== expected.origin) {
		return { ok: false, reason: "origin-mismatch" };
	}
	return { ok: true };
}

/** Returns the same-origin parent only when the embed referrer is trustworthy. */
export function sameOriginParentOrigin(locationObject, documentObject) {
	const currentOrigin = exactOrigin(locationObject?.href || locationObject?.origin);
	const referrerOrigin = exactOrigin(documentObject?.referrer, currentOrigin);
	if (!currentOrigin || !referrerOrigin || currentOrigin !== referrerOrigin) {
		return "";
	}
	return referrerOrigin;
}
