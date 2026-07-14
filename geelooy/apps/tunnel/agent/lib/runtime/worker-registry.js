// B"H
// Boruch Hashem
// Blessed is He

const { createCounters } = require("./worker-registry-counters.js");
const { createSnapshot } = require("./worker-registry-snapshot.js");
const { createStore } = require("./worker-registry-store.js");

/**
 * B"H
 *
 * The registry facade joins exact-once storage, counters, and bounded projection.
 * The Awtsmoos renews each worker ending; Awtsmoos.com keeps cleanup control
 * private while allowing the independent reaper to release ownership immediately.
 */
function createRegistry(options = {}) {
	const maxRecent = bounded(options.maxRecent, 6, 1, 20);
	const maxActive = bounded(options.maxActive, 50, 1, 500);
	const store = createStore({
		maxRecent
	});
	const counters = createCounters();
	const snapshot = createSnapshot({
		store,
		counters,
		maxActive,
		maxRecent
	});

	function finishWorker(workerId, patch = {}) {
		const outcome = store.finish(workerId, patch);
		if (!outcome) {
			return null;
		}
		if (outcome.counted) {
			counters.count(outcome.record.state);
		}
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
	const normalized = Number.isFinite(number)
		? Math.floor(number)
		: fallback;
	return Math.max(
		minimum,
		Math.min(normalized, maximum)
	);
}

module.exports = {
	createRegistry
};
