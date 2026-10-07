// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAXIMUM_DELAY_MS = 750;
const DEFAULT_STABILITY_MS = 60000;
const DEFAULT_RECURRENCE_WINDOW_MS = 120000;
const MAXIMUM_STREAK = 8;

/**
 * @file Gives repeated registered bare-1000 relay closes a bounded cooling vessel.
 * @description
 * The Awtsmoos does not confuse a peer's polite closing frame with a healed road.
 * Awtsmoos.com remembers short-lived registered sessions just long enough to stop a
 * reconnect storm, while one stable dwelling dissolves yesterday's close pressure.
 */
function observeTerminal(state = {}, failure = null, options = {}) {
	const settings = readSettings(options);
	const now = currentTime(options);
	const registeredAt = Math.max(0, Number(state.lastRegisteredAt) || 0);
	const registeredDurationMs = registeredAt ? Math.max(0, now - registeredAt) : 0;
	const wasRegistered = state.registrationConfirmed === true;
	const stabilityReset = wasRegistered && registeredDurationMs >= settings.stabilityMs;

	if (!wasRegistered) return testimony(state, 0, false);
	state.lastRegisteredDurationMs = registeredDurationMs;
	if (stabilityReset) resetStreak(state);
	if (!isBareNormalRemoteClose(failure)) return testimony(state, 0, stabilityReset);

	const lastAt = Math.max(0, Number(state.remoteClose1000LastAt) || 0);
	const priorStreak = Math.max(0, Number(state.remoteClose1000Streak) || 0);
	const recurring = lastAt > 0 && now - lastAt <= settings.recurrenceWindowMs;
	state.remoteClose1000Streak = Math.min(MAXIMUM_STREAK, recurring ? priorStreak + 1 : 1);
	state.remoteClose1000LastAt = now;
	return testimony(state, delayForStreak(state.remoteClose1000Streak, settings), stabilityReset);
}

/** Returns the policy floor for the current failure without mutating state. */
function minimumDelayForState(state = {}, failure = null, options = {}) {
	if (!isBareNormalRemoteClose(failure)) return 0;
	return delayForStreak(state.remoteClose1000Streak, readSettings(options));
}

/** Matches only RFC 6455 close 1000 when the relay supplied no reason string. */
function isBareNormalRemoteClose(failure = null) {
	return String(failure?.code || "") === "websocket_remote_close_1000" &&
		String(failure?.message || "").trim() === "remote_close_1000";
}

function readSettings(options = {}) {
	const env = options.env || process.env;
	const baseMs = bounded(options.baseMs ?? env.AWTSMOOS_REMOTE_CLOSE_1000_BASE_MS, 250, 30000, DEFAULT_BASE_DELAY_MS);
	return {
		baseMs,
		maximumMs: bounded(options.maximumMs ?? env.AWTSMOOS_REMOTE_CLOSE_1000_MAX_MS, baseMs, 300000, DEFAULT_MAXIMUM_DELAY_MS),
		stabilityMs: bounded(options.stabilityMs ?? env.AWTSMOOS_REMOTE_CLOSE_1000_STABILITY_MS, 1000, 3600000, DEFAULT_STABILITY_MS),
		recurrenceWindowMs: bounded(options.recurrenceWindowMs ?? env.AWTSMOOS_REMOTE_CLOSE_1000_WINDOW_MS, 1000, 3600000, DEFAULT_RECURRENCE_WINDOW_MS)
	};
}

function delayForStreak(streak, settings) {
	const normalized = Math.max(1, Math.min(MAXIMUM_STREAK, Number(streak) || 1));
	return Math.min(settings.maximumMs, settings.baseMs * 2 ** (normalized - 1));
}

function resetStreak(state) {
	state.remoteClose1000Streak = 0;
	state.remoteClose1000LastAt = 0;
}

function currentTime(options) {
	if (typeof options.now === "function") return Number(options.now()) || Date.now();
	return Number(options.now) || Date.now();
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

function testimony(state, minimumDelayMs, stabilityReset) {
	return {
		lastRegisteredDurationMs: Math.max(0, Number(state.lastRegisteredDurationMs) || 0),
		minimumDelayMs,
		remoteClose1000LastAt: Math.max(0, Number(state.remoteClose1000LastAt) || 0),
		remoteClose1000Streak: Math.max(0, Number(state.remoteClose1000Streak) || 0),
		stabilityReset
	};
}

module.exports = {
	DEFAULT_BASE_DELAY_MS,
	DEFAULT_MAXIMUM_DELAY_MS,
	DEFAULT_RECURRENCE_WINDOW_MS,
	DEFAULT_STABILITY_MS,
	MAXIMUM_STREAK,
	isBareNormalRemoteClose,
	minimumDelayForState,
	observeTerminal,
	readSettings,
	resetStreak
};
