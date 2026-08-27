// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects raw tunnel health into a bounded safe vessel.
 * @description
 * The Awtsmoos gives heartbeat and execution testimony without revealing the
 * hidden machinery behind it. Awtsmoos.com keeps this Binah vessel narrow: the
 * light of health may pass, while mailbox internals, workers, roots, and secrets
 * remain outside the public keli. Thus truth may rhyme with restraint in time.
 */

/**
 * B"H — Projects only health fields safe for Tunnel Control presentation.
 *
 * @param {object} device Raw account-authorized device record.
 * @returns {Readonly<object>} Frozen safe health projection.
 */
export function sanitizeDeviceHealth(device = {}) {
	return Object.freeze({
		heartbeatAt: safeStamp(device.heartbeatAt),
		lastSeenAt: safeStamp(device.lastSeenAt),
		livenessState: safeText(device.livenessState),
		probing: device.probing === true,
		missedHeartbeats: safeCount(device.missedHeartbeats),
		executionHealthSupported: device.executionHealthSupported === true,
		executionHealthy: safeBoolean(device.executionHealthy),
		executionHealthState: safeText(device.executionHealthState),
		executionHealthAt: safeStamp(device.executionHealthAt),
		executionHealthFresh: safeBoolean(device.executionHealthFresh)
	});
}

/**
 * B"H — Accepts an epoch/date-like value without manufacturing a timestamp.
 *
 * @param {*} value Candidate timestamp.
 * @returns {number|string|null} Safe primitive timestamp or null.
 */
function safeStamp(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string" && value.trim()) {
		return value.slice(0, 80);
	}
	return null;
}

/**
 * B"H — Bounds a health counter so malformed input cannot swell the UI model.
 *
 * @param {*} value Candidate numeric counter.
 * @returns {number} Non-negative bounded integer.
 */
function safeCount(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 0;
	}
	return Math.min(9999, Math.max(0, Math.round(number)));
}

/**
 * B"H — Preserves explicit boolean truth while retaining unknown as null.
 *
 * @param {*} value Candidate boolean.
 * @returns {boolean|null} Explicit boolean or null.
 */
function safeBoolean(value) {
	return typeof value === "boolean" ? value : null;
}

/**
 * B"H — Bounds presentation text while refusing objects and hidden structures.
 *
 * @param {*} value Candidate text.
 * @returns {string} Trimmed bounded text.
 */
function safeText(value) {
	return typeof value === "string" ? value.trim().slice(0, 100) : "";
}
