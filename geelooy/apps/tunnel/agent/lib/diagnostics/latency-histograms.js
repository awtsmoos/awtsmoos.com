// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded sliding-window latency percentiles per action family.
 * @description
 * Each completed or failed action records one sample keyed by action family
 * (bounded classifier, never the raw action name) and lane. Every family keeps
 * at most MAX_SAMPLES inside a WINDOW_MS sliding window, and the key space is
 * capped so an adversarial action-name spray cannot grow memory. Consumers read
 * snapshot() for p50/p95/p99, mean, min, max, and count.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SAMPLES = 2048;
const MAX_KEYS = 256;

const stores = new Map();

/** Bounded family classifier: first token of the action name, lowercased. */
function familyOf(action) {
	const raw = String(action || "").trim();
	if (!raw) return "unknown";
	const family = raw.split(/[:/.]/)[0].toLowerCase().slice(0, 64);
	return family || "unknown";
}

function keyOf(family, lane) {
	return `${family}::${String(lane || "p0").slice(0, 32)}`;
}

function prune(store, now) {
	const cutoff = now - WINDOW_MS;
	let start = 0;
	while (start < store.samples.length && store.samples[start].t < cutoff) start++;
	if (start > 0) store.samples.splice(0, start);
	if (store.samples.length > MAX_SAMPLES) {
		store.samples.splice(0, store.samples.length - MAX_SAMPLES);
	}
}

/**
 * Records one latency sample. Returns false for unusable input or when the
 * key-space cap is already full; never throws.
 */
function record(action, lane, durationMs) {
	const duration = Number(durationMs);
	if (!Number.isFinite(duration) || duration < 0) return false;
	const key = keyOf(familyOf(action), lane);
	let store = stores.get(key);
	if (!store) {
		if (stores.size >= MAX_KEYS) return false;
		store = { samples: [] };
		stores.set(key, store);
	}
	const now = Date.now();
	store.samples.push({ t: now, d: duration });
	prune(store, now);
	return true;
}

/** Nearest-rank percentile over an ascending array; null when empty. */
function percentile(sorted, p) {
	if (sorted.length === 0) return null;
	const rank = Math.ceil((p / 100) * sorted.length);
	return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))];
}

function statsFor(store) {
	prune(store, Date.now());
	const values = store.samples.map(sample => sample.d).sort((a, b) => a - b);
	if (values.length === 0) return null;
	const sum = values.reduce((total, value) => total + value, 0);
	return {
		count: values.length,
		mean: sum / values.length,
		min: values[0],
		max: values[values.length - 1],
		p50: percentile(values, 50),
		p95: percentile(values, 95),
		p99: percentile(values, 99)
	};
}

/** Point-in-time percentile snapshot for diagnostics; prunes expired samples. */
function snapshot() {
	const keys = {};
	for (const [key, store] of stores) {
		const stats = statsFor(store);
		if (!stats) continue;
		const separator = key.lastIndexOf("::");
		keys[key] = {
			family: key.slice(0, separator),
			lane: key.slice(separator + 2),
			...stats
		};
	}
	return { windowMs: WINDOW_MS, maxSamples: MAX_SAMPLES, keys };
}

function reset() {
	stores.clear();
}

module.exports = {
	MAX_KEYS,
	MAX_SAMPLES,
	WINDOW_MS,
	familyOf,
	percentile,
	record,
	reset,
	snapshot
};
