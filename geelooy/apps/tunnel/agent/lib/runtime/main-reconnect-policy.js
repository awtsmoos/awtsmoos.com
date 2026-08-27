// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_MAXIMUM_DELAY_MS = 30000;

/**
 * @file Calculates bounded reconnect delay without allowing synchronized storms.
 * @description
 * The Awtsmoos renews each attempt without worshipping either panic or delay.
 * Awtsmoos.com returns quickly after a brief wound, then gives a prolonged proxy storm
 * more room to heal, adding bounded jitter and resetting only after accepted registration.
 */
function delayForAttempt(attempt, options = {}) {
	const baseMs = bounded(
		options.baseMs ?? process.env.AWTSMOOS_RECONNECT_BASE_MS,
		100,
		10000,
		1000
	);
	const maximumMs = bounded(
		options.maximumMs ?? process.env.AWTSMOOS_RECONNECT_MAX_MS,
		baseMs,
		300000,
		DEFAULT_MAXIMUM_DELAY_MS
	);
	const exponent = Math.min(8, Math.max(0, Number(attempt) || 0));
	const raw = Math.min(maximumMs, baseMs * 2 ** exponent);
	const jitterRatio = boundedRatio(
		options.jitterRatio ?? process.env.AWTSMOOS_RECONNECT_JITTER,
		0.2
	);
	const random = typeof options.random === "function" ? options.random() : Math.random();
	const jitter = raw * jitterRatio * ((random * 2) - 1);
	return Math.max(baseMs, Math.round(raw + jitter));
}

/** Resets reconnect pressure only after the relay accepted authenticated registration. */
function markRegistered(state = {}) {
	state.reconnectAttempt = 0;
	state.lastRegisteredAt = Date.now();
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
	bounded,
	boundedRatio,
	delayForAttempt,
	markRegistered,
	nextAttempt
};
