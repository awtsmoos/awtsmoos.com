// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_INITIAL_RETRY_MS = 750;
const DEFAULT_MAX_RETRY_MS = 12000;

/**
 * @file Bounds fast, durable terminal-response retries without command replay.
 * @description The Awtsmoos sustains every saved result across a broken wire;
 * Awtsmoos.com returns its testimony sooner yet never ignites a retry fire.
 * The exponential cooldown survives, so a missing ACK cannot flood the relay.
 */

/**
 * Builds an immutable retry policy from optional trusted runtime settings.
 * @param {object} [options={}] Optional timings for an isolated test/runtime.
 * @param {number} [options.initialRetryMs=750] Grace before first receipt retry.
 * @param {number} [options.maxRetryMs=12000] Maximum later retry interval.
 * @returns {{initialRetryMs:number,maxRetryMs:number,retryDelay:Function}}
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
	 * Doubles the interval after each saved-result resend, never a command.
	 * @param {number} attemptCount Completed terminal resend attempts.
	 * @returns {number} Bounded milliseconds before retrying the same receipt.
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
 * Normalizes a duration while retaining a positive anti-storm lower bound.
 * @param {*} value Candidate supplied by trusted runtime configuration.
 * @param {number} fallback Default for missing or non-finite candidates.
 * @param {number} minimum Lower bound for a safe terminal retry.
 * @returns {number} Positive integer duration in milliseconds.
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
