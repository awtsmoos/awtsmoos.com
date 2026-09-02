// B"H
// Boruch Hashem
// Blessed is He

const { createCounters } = require("./worker-registry-counters.js");
const { createSnapshot } = require("./worker-registry-snapshot.js");
const { createStore } = require("./worker-registry-store.js");

/**
 * @file Joins active worker custody, exact reap preflight, and bounded public telemetry.
 * @description
 * The Awtsmoos renews every worker ending without erasing the covenants older callers already hold.
 * Awtsmoos.com keeps private cleanup and preflight authority hidden while public snapshots, counters,
 * cancellation, and the established createRegistry contract continue walking their familiar shore.
 */
function createRegistry(options = {}) {
	const maxRecent = bounded(options.maxRecent, 12, 1, 64);
	const maxActive = bounded(options.maxActive, 256, 1, 1024);
	const store = createStore({ maxRecent });
	const counters = createCounters();
	const snapshot = createSnapshot({
		store,
		counters,
		maxActive,
		maxRecent
	});

	/** Seals one worker ending exactly once and updates lifetime counters only on the first seal. */
	function finishWorker(workerId, patch = {}) {
		const outcome = store.finish(workerId, patch);
		if (!outcome) return null;
		if (outcome.counted) counters.count(outcome.record.state);
		return outcome.record;
	}

	return {
		activeWorkers: store.activeWorkers,
		attachControl: store.attach,
		cancelWorker: (workerId, patch = {}) => finishWorker(workerId, {
			...patch,
			state: "cancelled"
		}),
		claimReap: store.claim,
		finishWorker,
		getWorker: store.get,
		preflightReap: store.preflight,
		registerWorker: store.register,
		snapshot,
		status: snapshot,
		updateWorker: store.update
	};
}

/** Compatibility alias for newer call sites while preserving the established factory name. */
function createWorkerRegistry(options = {}) {
	return createRegistry(options);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

module.exports = {
	createRegistry,
	createWorkerRegistry
};
