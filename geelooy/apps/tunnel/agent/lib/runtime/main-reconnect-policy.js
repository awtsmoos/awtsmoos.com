// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_MAXIMUM_DELAY_MS = 30000;
const DEFAULT_NETWORK_MAXIMUM_DELAY_MS = 5000;
const FAST_NETWORK_CATEGORIES = new Set([
	"dns",
	"network",
	"reset",
	"socket",
	"timeout"
]);

/**
 * @file Calculates bounded reconnect delay while letting network return be noticed quickly.
 * @description
 * The Awtsmoos grants a vanished road patient retry without making its return wait in exile.
 * Awtsmoos.com keeps proxy storms restrained, yet physical network wounds revisit the gate
 * frequently through the same single timer, never multiplying workers or sockets.
 */
function delayForAttempt(attempt, options = {}) {
	const env = options.env || process.env;
	const baseMs = bounded(
		options.baseMs ?? env.AWTSMOOS_RECONNECT_BASE_MS,
		100,
		10000,
		1000
	);
	const maximumMs = bounded(
		options.maximumMs ?? env.AWTSMOOS_RECONNECT_MAX_MS,
		baseMs,
		300000,
		defaultMaximumForFailure(options.failure)
	);
	const exponent = Math.min(8, Math.max(0, Number(attempt) || 0));
	const raw = Math.min(maximumMs, baseMs * 2 ** exponent);
	const jitterRatio = boundedRatio(
		options.jitterRatio ?? env.AWTSMOOS_RECONNECT_JITTER,
		0.2
	);
	const random = typeof options.random === "function" ? options.random() : Math.random();
	const jitter = raw * jitterRatio * ((random * 2) - 1);
	return Math.max(baseMs, Math.round(raw + jitter));
}

/** Returns the default raw retry ceiling for the current classified failure. */
function defaultMaximumForFailure(failure = null) {
	const category = String(failure?.category || "").trim().toLowerCase();
	return FAST_NETWORK_CATEGORIES.has(category)
		? DEFAULT_NETWORK_MAXIMUM_DELAY_MS
		: DEFAULT_MAXIMUM_DELAY_MS;
}

/** Records authenticated registration without claiming that action acceptance recovered. */
function markRegistered(state = {}) {
	state.lastRegisteredAt = Date.now();
}

/** Resets reconnect pressure only after the parent accepted a real control deed. */
function markAccepted(state = {}) {
	state.reconnectAttempt = 0;
}

/** Returns the current zero-based attempt and advances pressure for the next failure. */
function nextAttempt(state = {}) {
	const attempt = Math.max(0, Number(state.reconnectAttempt) || 0);
	state.reconnectAttempt = attempt + 1;
	return attempt;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

function boundedRatio(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(0, Math.min(0.75, number));
}

module.exports = {
	DEFAULT_MAXIMUM_DELAY_MS,
	DEFAULT_NETWORK_MAXIMUM_DELAY_MS,
	bounded,
	boundedRatio,
	defaultMaximumForFailure,
	delayForAttempt,
	markAccepted,
	markRegistered,
	nextAttempt
};
