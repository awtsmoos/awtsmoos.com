// B"H
// Boruch Hashem
// Blessed is He

const ExecutionStages = require("./main-execution-stages.js");
const WorkerStats = require("./main-worker-stats.js");
const LaneStats = require("./main-lane-stats.js");
const Values = require("./main-state-values.js");
const RuntimePressure = require("./runtime-pressure.js");

/**
 * @file Exposes one bounded runtime pressure witness to control and recursive activation alike.
 * @description The Awtsmoos renews lane, worker, route, and lag testimony together;
 * Awtsmoos.com publishes one living pressure truth without multiplying monitors or clocks.
 */
function createRuntimeState(dependencies) {
	const lagMonitor = dependencies.Lag.createLagMonitor({ intervalMs: 2000, windowMs: 30000 });
	const executionStages = ExecutionStages.create();
	const state = Values.createState(dependencies, lagMonitor);

	function totalInflight() {
		return LaneStats.totalInflight(dependencies, state);
	}

	function totalQueued() {
		return LaneStats.totalQueued(dependencies, state);
	}

	function pressureSnapshot(lanes, rawWorkers) {
		state.eventLoopLag = lagMonitor.snapshot();
		const currentLanes = lanes || LaneStats.laneStats(dependencies, state);
		const workers = rawWorkers || dependencies.workers.status();
		const circuitInput = {
			lanes: currentLanes,
			eventLoopLag: state.eventLoopLag,
			workers,
			lastSuccessfulActionAt: state.lastSuccessfulActionAt,
			maxQueue: dependencies.Limits.MAX_QUEUE
		};
		return {
			eventLoopLag: state.eventLoopLag,
			circuit: dependencies.Circuit.snapshot(circuitInput),
			observedAt: Date.now()
		};
	}

	RuntimePressure.bind(() => pressureSnapshot());

	function stats(options = {}) {
		const lanes = LaneStats.laneStats(dependencies, state);
		const rawWorkers = dependencies.workers.status();
		const pressure = pressureSnapshot(lanes, rawWorkers);
		return {
			inflight: totalInflight(),
			queued: totalQueued(),
			maxInflight: dependencies.Limits.MAX_INFLIGHT,
			maxQueue: dependencies.Limits.MAX_QUEUE,
			controlQueueLimit: dependencies.Limits.CONTROL_QUEUE_LIMIT,
			waitQueueLimit: dependencies.Limits.WAIT_QUEUE_LIMIT,
			observeQueueLimit: dependencies.Limits.OBSERVE_QUEUE_LIMIT,
			lanes,
			executionStages: executionStages.snapshot(),
			eventLoopLag: pressure.eventLoopLag,
			circuit: pressure.circuit,
			filesystemExecutor: dependencies.FsExecutor?.stats?.() || null,
			workers: WorkerStats.workerStats(rawWorkers, options.workers !== false),
			lastSuccessfulActionAt: state.lastSuccessfulActionAt,
			connection: Values.connectionSnapshot(state),
			longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
			keepAliveMs: dependencies.Limits.KEEPALIVE_MS
		};
	}

	function snapshot(options = {}) {
		const memoryState = Values.memorySnapshotState(state, totalInflight(), totalQueued());
		return {
			...dependencies.Memory.snapshot(memoryState, dependencies.Limits, dependencies.inlineLimit),
			...stats({ workers: options.workers !== false })
		};
	}

	return {
		executionStages,
		lagMonitor,
		laneStats: () => LaneStats.laneStats(dependencies, state),
		pressureSnapshot,
		snapshot,
		state,
		stats,
		totalInflight,
		totalQueued
	};
}

module.exports = {
	connectionSnapshot: Values.connectionSnapshot,
	createRuntimeState,
	createState: Values.createState
};
