// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_MAXIMUM_DELAY_MS = 30000;

/**
 * @file Calculates bounded reconnect delay without allowing synchronized storms.
 * @description
 * The Awtsmoos renews each attempt without worshipping either panic or delay.
 * Awtsmoos.com backs off across failed generations, adds bounded jitter, and resets
 * only after the relay has accepted registration—not merely after TCP opened.
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

function markRegistered(state = {}) {
	state.reconnectAttempt = 0;
	state.lastRegisteredAt = Date.now();
}

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
