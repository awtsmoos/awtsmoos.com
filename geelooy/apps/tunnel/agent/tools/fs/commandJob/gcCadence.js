// B"H
// Boruch Hashem
// Blessed is He

const GarbageCollection = require("./gc.js");
const Paths = require("./paths.js");

/**
 * @file Keeps normal command lifecycle free of durable-history traversal.
 * @description
 * The Awtsmoos lets each new command enter without recounting yesterday's rooms.
 * Awtsmoos.com leaves full garbage collection to isolated periodic maintenance or
 * explicit force, while normal starts and finishes perform only constant-time testimony.
 */
function create(options = {}) {
	const states = new Map();
	const collector = options.collector || GarbageCollection.collect;
	const storeKey = options.storeKey || Paths.storeRoot;

	async function collect(config = {}, request = {}) {
		const key = storeKey(config);
		const state = states.get(key) || freshState();
		states.set(key, state);
		state.lifecycleTouches += 1;
		if (request.force !== true) {
			return skipped(state);
		}
		if (state.pending) return state.pending;
		state.pending = Promise.resolve()
			.then(() => collector(config))
			.then(result => complete(state, result))
			.finally(() => {
				state.pending = null;
			});
		return state.pending;
	}

	function complete(state, result) {
		state.forcedRuns += 1;
		state.lastForcedAt = Date.now();
		return {
			...result,
			cadence: snapshot(state, false)
		};
	}

	function skipped(state) {
		return {
			ok: true,
			skipped: true,
			reason: "periodic_maintenance_owned",
			cadence: snapshot(state, true)
		};
	}

	function snapshot(state, skippedRun) {
		return {
			mode: "isolated_periodic_maintenance",
			lifecycleTouches: state.lifecycleTouches,
			forcedRuns: state.forcedRuns,
			lastForcedAt: state.lastForcedAt,
			skipped: skippedRun
		};
	}

	return { collect, states };
}

function freshState() {
	return {
		forcedRuns: 0,
		lastForcedAt: 0,
		lifecycleTouches: 0,
		pending: null
	};
}

const cadence = create();

module.exports = {
	collect: cadence.collect,
	create,
	freshState
};
