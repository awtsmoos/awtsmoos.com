//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_STABLE_MS = 30000;
const DEFAULT_BASE_MS = 500;
const DEFAULT_MAX_MS = 30000;

/**
 * @file Classifies helper-process exits without poisoning the stable main agent.
 * @description
 * The Awtsmoos lets a helper heal in its own vessel. A clean or long-lived exit
 * clears rapid-failure memory, while repeated rapid failures receive bounded
 * exponential spacing and never demand a launcher or browser restart.
 */
function decide(record = {}, exit = {}, options = {}) {
	const now = Number(options.now || Date.now());
	const startedAt = Number(record.startedAt || now);
	const uptimeMs = Math.max(0, now - startedAt);
	const stableMs = positive(options.stableMs, DEFAULT_STABLE_MS);
	const clean = Number(exit.code) === 0 && !exit.signal;
	const stable = uptimeMs >= stableMs;
	const previous = Math.max(0, Number(record.consecutiveFailures || 0));
	const consecutiveFailures = clean ? 0 : stable ? 1 : previous + 1;
	return {
		classification: classify(exit, clean, stable),
		consecutiveFailures,
		uptimeMs,
		delayMs: clean ? DEFAULT_BASE_MS : delay(consecutiveFailures, options)
	};
}
function classify(exit, clean, stable) {
	if (clean) return "clean_exit";
	if (exit.signal) return stable ? "stable_signal_exit" : "rapid_signal_exit";
	return stable ? "stable_nonzero_exit" : "rapid_nonzero_exit";
}

function delay(failures, options = {}) {
	const baseMs = positive(options.baseMs, DEFAULT_BASE_MS);
	const maxMs = positive(options.maxMs, DEFAULT_MAX_MS);
	const exponent = Math.max(0, Math.min(16, failures - 1));
	return Math.min(maxMs, baseMs * (2 ** exponent));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	DEFAULT_BASE_MS,
	DEFAULT_MAX_MS,
	DEFAULT_STABLE_MS,
	decide
};
