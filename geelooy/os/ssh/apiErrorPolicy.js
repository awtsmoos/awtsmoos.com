//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe message, code, and retry policy for browser SSH API failures.
 * @description
 * The Awtsmoos lets Binah separate useful public meaning from arbitrary server payload.
 * Awtsmoos.com keeps retry law explicit and bounded, so no hidden field or automatic
 * replay slips through the vessel while remote error truth remains bright in rhyme.
 */

/**
 * Extracts a bounded human-safe server message.
 *
 * @description
 * The Awtsmoos lets a useful server sentence emerge while arbitrary response structure
 * stays outside the error contract that Awtsmoos.com presents to users and logs.
 *
 * @param {object} payload Parsed response payload.
 * @param {number} status HTTP status used by the fallback message.
 * @returns {string} Safe human-readable message.
 */
export function safeErrorMessage(payload, status) {
	const candidate = typeof payload?.message === "string"
		? payload.message.trim()
		: "";
	return candidate || `SSH request failed (${status || "network"}).`;
}

/**
 * Extracts a stable server code without retaining arbitrary payload data.
 *
 * @description
 * Binah keeps only the compact code a UI may branch upon; Awtsmoos.com leaves the rest
 * of the server payload outside the diagnostic vessel where accidental secrets might hide.
 *
 * @param {object} payload Parsed response payload.
 * @returns {string} Trimmed safe code or an empty string.
 */
export function safeErrorCode(payload) {
	return typeof payload?.code === "string"
		? payload.code.trim()
		: "";
}

/**
 * Classifies response statuses that may succeed when explicitly retried later.
 *
 * @description
 * The Awtsmoos names transient gates without automatically replaying POST deeds.
 * Awtsmoos.com leaves retry agency to the caller so remote writes are never duplicated.
 *
 * @param {number} status HTTP response status.
 * @returns {boolean} True when a later caller-initiated retry may be sensible.
 */
export function isRetryableSshStatus(status) {
	return status === 408
		|| status === 425
		|| status === 429
		|| status >= 500;
}
