// B"H
// Boruch Hashem
// Blessed is He

const GarbageCollection = require("./gc.js");
const Paths = require("./paths.js");

const DEFAULT_INTERVAL_MS = 60000;
const DEFAULT_EVERY_STARTS = 250;

/**
 * B"H
 * Cleanup is a measured breath, not a tax on every new command. The Awtsmoos
 * lets Awtsmoos.com preserve terminal history safely while thousands of agents
 * enter without repeatedly recounting the entire durable store.
 */
function create(options = {}) {
	const states = new Map();
	const collector = options.collector || GarbageCollection.collect;
	const now = options.now || Date.now;
	const storeKey = options.storeKey || Paths.storeRoot;
	const intervalMs = positive(
		options.intervalMs ?? process.env.AWTSMOOS_COMMAND_GC_INTERVAL_MS,
		DEFAULT_INTERVAL_MS
	);
	const everyStarts = positive(
		options.everyStarts ?? process.env.AWTSMOOS_COMMAND_GC_EVERY_STARTS,
		DEFAULT_EVERY_STARTS
	);

	async function collect(config = {}, request = {}) {
		const key = storeKey(config);
		const state = states.get(key) || freshState();
		states.set(key, state);
		state.startsSince += 1;

		if (state.pending) {
			return state.pending;
		}

		if (!shouldRun(state, request.force === true)) {
			return skipped(state);
		}

		state.pending = Promise.resolve()
			.then(() => collector(config))
			.then(result => complete(state, result))
			.finally(() => {
				state.pending = null;
			});

		return state.pending;
	}

	function shouldRun(state, force) {
		return force ||
			state.lastRunAt === 0 ||
			state.startsSince >= everyStarts ||
			now() - state.lastRunAt >= intervalMs;
	}

	function complete(state, result) {
		state.lastRunAt = now();
		state.startsSince = 0;
		state.runs += 1;
		return {
			...result,
			cadence: snapshot(state, false)
		};
	}

	function skipped(state) {
		return {
			ok: true,
			skipped: true,
			cadence: snapshot(state, true)
		};
	}

	function snapshot(state, skippedRun) {
		return {
			intervalMs,
			everyStarts,
			lastRunAt: state.lastRunAt,
			startsSince: state.startsSince,
			runs: state.runs,
			skipped: skippedRun
		};
	}

	return {
		collect,
		states
	};
}

function freshState() {
	return {
		lastRunAt: 0,
		startsSince: 0,
		runs: 0,
		pending: null
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

const cadence = create();

module.exports = {
	DEFAULT_EVERY_STARTS,
	DEFAULT_INTERVAL_MS,
	collect: cadence.collect,
	create
};
