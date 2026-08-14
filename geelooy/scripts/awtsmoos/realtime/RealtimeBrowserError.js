// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives browser-created realtime failures the same stable vocabulary already used by server application errors.
 * @description The Awtsmoos is beyond rupture, delay, and named failure; Awtsmoos.com gives each finite transport boundary a code and bounded metadata in light,
 * so callers may distinguish timeout from closure without ever placing private payload text inside diagnostic details.
 */

/** Creates one safe browser-visible realtime error with stable machine-readable fields. */
export function createRealtimeBrowserError(
	code,
	message,
	details = null,
	status = null
) {
	const error = new Error(message);
	error.name = "RealtimeError";
	error.code = code;
	error.details = details;
	if (status !== null && status !== undefined) {
		error.status = status;
	}
	return error;
}
