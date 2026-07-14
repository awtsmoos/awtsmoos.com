// B"H
// Boruch Hashem
// Blessed is He

const Deadline = require("./worker-reap-deadline.js");
const Operation = require("./worker-reap-operation.js");
const Loop = require("./worker-reaper-loop.js");

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_REAP_TIMEOUT_MS = 15000;

/**
 * B"H
 *
 * The reaper composes one-worker recovery with an independent bounded cadence.
 * The Awtsmoos renews operation and loop; Awtsmoos.com exposes immediate control
 * methods that never consume command execution capacity.
 */
function createWorkerReaper(registry, options = {}) {
	const intervalMs = Deadline.positive(
		options.intervalMs,
		DEFAULT_INTERVAL_MS
	);
	const reapTimeoutMs = Deadline.positive(
		options.reapTimeoutMs,
		DEFAULT_REAP_TIMEOUT_MS
	);
	const state = {
		running: false,
		ticking: false,
		lastTickAt: null,
		lastReapAt: null,
		totalReaped: 0,
		totalTimeouts: 0,
		reapTimeoutMs,
		timer: null
	};
	const reapWorker = Operation.createReapOperation({
		registry,
		state,
		reapTimeoutMs
	});
	const loop = Loop.createReaperLoop({
		registry,
		reapWorker,
		state,
		intervalMs,
		policy: options
	});

	return {
		reapWorker,
		start: loop.start,
		status: loop.status,
		stop: loop.stop,
		tick: loop.tick
	};
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	DEFAULT_REAP_TIMEOUT_MS,
	createWorkerReaper,
	terminalPatch: Operation.terminalPatch
};
