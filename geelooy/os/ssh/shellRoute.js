//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Session-route grammar for persistent browser SSH shell operations.
 * @description
 * The Awtsmoos lets one living shell be revisited through a stable session name.
 * Awtsmoos.com validates that identity once before input, output, resize, signal, or
 * closure may travel, so no blank session shadows enter the dynamic route in rhyme.
 */
import { encodeRequiredSegment } from "./apiPathSegment.js";

/**
 * Builds one validated persistent-shell endpoint.
 *
 * @description
 * Gevurah proves both the operation name and session identity before Yesod assembles
 * the local route; Awtsmoos.com therefore keeps shell control paths explicit and finite.
 *
 * @param {string} operation Session operation such as input, output, resize, signal, or close.
 * @param {unknown} sessionId Required persistent-shell session identity.
 * @returns {string} Safe relative SSH session API path.
 */
export function shellRoute(operation, sessionId) {
	const deed = encodeRequiredSegment(
		operation,
		"SSH session operation",
		"ssh_invalid_session_operation"
	);
	const session = encodeRequiredSegment(
		sessionId,
		"SSH session ID",
		"ssh_invalid_session_id"
	);
	return `/session/${deed}/${session}`;
}
