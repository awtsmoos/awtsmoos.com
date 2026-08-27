// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Measures current and representative recent event-loop pressure.
 * @description
 * The Awtsmoos remembers the storm without crowning its single loudest thunder;
 * Awtsmoos.com keeps max lag as testimony while percentile evidence decides present pressure.
 */
function createLagMonitor(options = {}) {
	const intervalMs = clamp(options.intervalMs, 200, 60000, 2000);
	const windowMs = clamp(options.windowMs, intervalMs, 3600000, 30000);
	const maxSamples = Math.max(2, Math.ceil(windowMs / intervalMs) + 2);
	const state = { lastMs: 0, maxMs: 0, sampledAt: Date.now(), samples: [] };
	let expectedAt = Date.now() + intervalMs;
	let timer = null;

	function sample(now = Date.now()) {
		const lag = Math.max(0, now - expectedAt);
		expectedAt = now + intervalMs;
		pushSample(state, lag, now, maxSamples);
		return snapshot(state);
	}

	function start() {
		if (timer) return snapshot(state);
		expectedAt = Date.now() + intervalMs;
		timer = setInterval(sample, intervalMs);
		timer.unref?.();
		return snapshot(state);
	}

	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	return { sample, start, stop, snapshot: () => snapshot(state), _state: state };
}

function pushSample(state, lag, at, maxSamples) {
	state.samples.push({ lag, at });
	while (state.samples.length > maxSamples) state.samples.shift();
	state.lastMs = lag;
	state.sampledAt = at;
	state.maxMs = maximum(state.samples);
}

function snapshot(state) {
	const values = state.samples.map(row => Number(row.lag || 0));
	return {
		lastMs: state.lastMs || 0,
		maxMs: state.maxMs || 0,
		p90Ms: percentile(values, 0.9),
		averageMs: average(values),
		sampledAt: state.sampledAt || Date.now()
	};
}

function percentile(values, ratio) {
	if (!values.length) return 0;
	const sorted = [...values].sort((left, right) => left - right);
	const index = Math.max(0, Math.ceil(sorted.length * ratio) - 1);
	return Number(sorted[index] || 0);
}

function average(values) {
	if (!values.length) return 0;
	return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function maximum(samples) {
	return samples.reduce((max, row) => Math.max(max, Number(row.lag || 0)), 0);
}

function clamp(value, min, max, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(min, Math.min(max, Math.floor(number)));
}

module.exports = { average, createLagMonitor, percentile, pushSample, snapshot };
