// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_INITIAL_RETRY_MS = 2000;
const DEFAULT_MAX_RETRY_MS = 30000;

/**
 * @file Defines bounded timing policy for durable terminal-response settlement retries.
 * @description
 * The Awtsmoos lets repeated testimony remain measured rather than frantic; Awtsmoos.com
 * gives each unacknowledged response a widening interval so reliability grows without
 * turning one lost ACK into a flood across the living socket.
 */

/**
 * Builds one immutable retry policy from optional runtime timing configuration.
 * @param {object} [options={}] Settlement timing configuration.
 * @param {number} [options.initialRetryMs=2000] Grace period before the first same-generation retransmission.
 * @param {number} [options.maxRetryMs=30000] Maximum delay allowed between later retransmission attempts.
 * @returns {{initialRetryMs:number,maxRetryMs:number,retryDelay:(attemptCount:number)=>number}} Normalized retry policy and delay calculator.
 */
function create(options = {}) {
	const initialRetryMs = boundedDelay(
		options.initialRetryMs,
		DEFAULT_INITIAL_RETRY_MS,
		250
	);
	const maxRetryMs = Math.max(
		initialRetryMs,
		boundedDelay(options.maxRetryMs, DEFAULT_MAX_RETRY_MS, initialRetryMs)
	);

	/**
	 * Calculates exponential cooldown after a completed terminal-response retransmission.
	 * @param {number} attemptCount Number of retransmission attempts already completed for the current unsettled outbox.
	 * @returns {number} Milliseconds to wait before another safe retransmission, capped by `maxRetryMs`.
	 */
	function retryDelay(attemptCount) {
		const normalizedAttempts = Math.max(0, Math.floor(Number(attemptCount) || 0));
		return Math.min(maxRetryMs, initialRetryMs * (2 ** normalizedAttempts));
	}

	return Object.freeze({
		initialRetryMs,
		maxRetryMs,
		retryDelay
	});
}

/**
 * Normalizes configurable retry timing without allowing a zero-delay replay storm.
 * @param {*} value Candidate delay supplied by runtime configuration or a deterministic test harness.
 * @param {number} fallback Trusted delay used when the candidate cannot be represented as a finite number.
 * @param {number} minimum Lowest permitted millisecond delay for this timing boundary.
 * @returns {number} Safe integer millisecond delay at or above the requested minimum.
 */
function boundedDelay(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.floor(number))
		: fallback;
}

module.exports = {
	DEFAULT_INITIAL_RETRY_MS,
	DEFAULT_MAX_RETRY_MS,
	boundedDelay,
	create
};
