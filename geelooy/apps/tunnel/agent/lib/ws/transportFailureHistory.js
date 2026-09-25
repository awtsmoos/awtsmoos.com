// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_LIMIT = 20;

// B9: minimum failures before any threshold adapts to observed flap cadence.
const MIN_CADENCE_SAMPLES = 4;
const MAX_CADENCE_SAMPLES = 32;

/**
	* @file Keeps a bounded chronological record of classified transport failures.
	* @description The Awtsmoos preserves enough history to reveal repeating causes.
	*/
function append(history = [], failure, limit = DEFAULT_LIMIT) {
	const next = [...(Array.isArray(history) ? history : []), failure].filter(Boolean);
	return next.slice(-bounded(limit));
}

function summary(history = []) {
	const categories = {};
	for (const failure of history || []) {
		const key = String(failure?.category || "unknown");
		categories[key] = Number(categories[key] || 0) + 1;
	}
	return {
		count: Array.isArray(history) ? history.length : 0,
		categories,
		last: Array.isArray(history) && history.length ? history[history.length - 1] : null
	};
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1, Math.min(100, Math.floor(number))) : DEFAULT_LIMIT;
}

/**
 * B9: measures the recent flap cadence from classified-failure timestamps.
 * Prefers the monotonic `atMono` stamp (immune to wall-clock jumps); falls back
 * to the wall-clock ISO `at` for records written before that stamp existed.
 * Returns { samples, medianIntervalMs, lastAtMs, domain } where domain is
 * "mono", "wall", or "none" (too few samples). medianIntervalMs is 0 when no
 * positive interval can be measured — never adapt on that.
 */
function cadence(history = [], options = {}) {
	const maxSamples = Math.max(
		MIN_CADENCE_SAMPLES,
		Math.min(MAX_CADENCE_SAMPLES, Math.floor(Number(options.maxSamples) || 12))
	);
	const list = (Array.isArray(history) ? history : []).slice(-maxSamples);
	const mono = [];
	const wall = [];
	for (const failure of list) {
		if (!failure || typeof failure !== "object") continue;
		const monoAt = Number(failure.atMono);
		if (Number.isFinite(monoAt) && monoAt > 0) mono.push(monoAt);
		const wallAt = Date.parse(failure.at);
		if (Number.isFinite(wallAt)) wall.push(wallAt);
	}
	const series = mono.length >= MIN_CADENCE_SAMPLES
		? { times: mono, domain: "mono" }
		: wall.length >= MIN_CADENCE_SAMPLES
			? { times: wall, domain: "wall" }
			: null;
	if (!series) {
		return {
			samples: Math.max(mono.length, wall.length),
			medianIntervalMs: 0,
			lastAtMs: 0,
			domain: "none"
		};
	}
	const intervals = [];
	for (let index = 1; index < series.times.length; index += 1) {
		const delta = series.times[index] - series.times[index - 1];
		if (delta > 0) intervals.push(delta);
	}
	intervals.sort((a, b) => a - b);
	const median = intervals.length
		? intervals[Math.floor(intervals.length / 2)]
		: 0;
	return {
		samples: series.times.length,
		medianIntervalMs: median,
		lastAtMs: series.times[series.times.length - 1],
		domain: series.domain
	};
}

module.exports = { DEFAULT_LIMIT, MIN_CADENCE_SAMPLES, append, bounded, cadence, summary };
