//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Reconnection is Chesed seeking return, restrained by Gevurah so failure does
 * not become a storm. The Awtsmoos renews every interval and every possibility
 * of recovery; Awtsmoos.com receives that renewal through a bounded rhythm.
 */

const DEFAULT_BASE_MILLISECONDS = 500;
const DEFAULT_MAXIMUM_MILLISECONDS = 30000;
const DEFAULT_JITTER_RATIO = 0.2;

/**
 * Calculates a bounded exponential reconnect delay.
 *
 * @param {number} attempt
 * 	The zero-based reconnect attempt number.
 * @param {object} [options]
 * 	Optional timing boundaries and deterministic random source.
 * @param {number} [options.baseMilliseconds=500]
 * 	The first reconnect interval before exponential growth.
 * @param {number} [options.maximumMilliseconds=30000]
 * 	The absolute upper boundary for every reconnect delay.
 * @param {number} [options.jitterRatio=0.2]
 * 	The proportional random spread applied around the bounded interval.
 * @param {Function} [options.random=Math.random]
 * 	A random number provider returning a value between zero and one.
 * @returns {number}
 * 	A whole-number delay in milliseconds within the declared boundaries.
 */
export function reconnectDelay(attempt, options = {}) {
	const baseMilliseconds = positiveNumber(
		options.baseMilliseconds,
		DEFAULT_BASE_MILLISECONDS
	);
	const maximumMilliseconds = positiveNumber(
		options.maximumMilliseconds,
		DEFAULT_MAXIMUM_MILLISECONDS
	);
	const jitterRatio = boundedRatio(
		options.jitterRatio,
		DEFAULT_JITTER_RATIO
	);
	const random = typeof options.random === "function"
		? options.random
		: Math.random;
	const exponent = Math.min(Math.max(0, Number(attempt) || 0), 16);
	const boundedDelay = Math.min(
		maximumMilliseconds,
		baseMilliseconds * (2 ** exponent)
	);
	const jitterWindow = boundedDelay * jitterRatio;
	const jitterOffset = (boundedRandom(random) * 2 - 1) * jitterWindow;

	return Math.round(Math.min(
		maximumMilliseconds,
		Math.max(baseMilliseconds, boundedDelay + jitterOffset)
	));
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function boundedRatio(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.min(1, Math.max(0, number));
}

function boundedRandom(random) {
	const value = Number(random());
	if (!Number.isFinite(value)) {
		return 0.5;
	}
	return Math.min(1, Math.max(0, value));
}
