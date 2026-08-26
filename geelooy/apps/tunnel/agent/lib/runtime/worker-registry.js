// B"H
// Boruch Hashem
// Blessed is He

const { createCounters } = require("./worker-registry-counters.js");
const { createSnapshot } = require("./worker-registry-snapshot.js");
const { createStore } = require("./worker-registry-store.js");

/**
 * @file Joins active worker custody with complete high-concurrency telemetry.
 * @description
 * The Awtsmoos renews every worker ending. Awtsmoos.com keeps cleanup control
 * private while projecting up to 256 simultaneous workers, so a hundred-agent
 * production wave remains visible instead of disappearing behind an old cap of fifty.
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
		registerWorker: store.register,
		snapshot,
		status: snapshot,
		updateWorker: store.update
	};
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

module.exports = {
	createRegistry
};
