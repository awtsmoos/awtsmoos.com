// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Interprets tunnel execution receipts without exposing credential material.
 * @description
 * The Awtsmoos renews connection and action as separate rays of light;
 * Awtsmoos.com names a dead execution lane even while old heartbeat memory looked bright.
 */

const DEGRADED_PATTERNS = [
	"device_request_acceptance_timeout",
	"device_consumer_progress_timeout",
	"tunnelRequestAcceptanceTimedOut",
	"tunnelRequestConsumerStalled",
	"canonical_request_pending",
	"504"
];

/**
 * @description Creates neutral execution health before any action receipt is observed.
 * @returns {{state:string,message:string}} Unknown execution health.
 * @sideEffects None.
 */
export function createUnknownExecutionHealth() {
	return {
		state: "unknown",
		message: "Execution has not been proven by an action receipt yet."
	};
}

/**
 * @description Creates execution-ready evidence after a successful tunnel-backed action.
 * @param {string} message - Safe human description of the proven action.
 * @returns {{state:string,message:string}} Ready execution health.
 * @sideEffects None.
 */
export function createReadyExecutionHealth(message = "Tunnel execution accepted a live action.") {
	return {
		state: "ready",
		message: String(message).slice(0, 320)
	};
}

/**
 * @description Determines whether an API failure indicates transport or consumer degradation.
 * @param {*} error - Unknown thrown API value.
 * @returns {boolean} True when safe error text matches an execution-degradation signature.
 * @sideEffects None.
 */
export function isExecutionDegradedError(error) {
	const response = error?.response || {};
	const safeText = [
		response.error,
		response.action,
		response.message,
		error?.message,
		response.status,
		error?.status
	].filter(Boolean).join(" ");
	return DEGRADED_PATTERNS.some((pattern) => safeText.includes(pattern));
}

/**
 * @description Converts one transport failure into safe operator guidance without raw secrets.
 * @param {*} error - Unknown thrown API value.
 * @returns {{state:string,message:string}} Degraded or unknown execution health.
 * @sideEffects None.
 */
export function revealExecutionHealthFromError(error) {
	if (!isExecutionDegradedError(error)) {
		return createUnknownExecutionHealth();
	}
	return {
		state: "degraded",
		message: "Native execution is not accepting actions. Refresh the saved tunnel agent with the standard installer, then retry."
	};
}
