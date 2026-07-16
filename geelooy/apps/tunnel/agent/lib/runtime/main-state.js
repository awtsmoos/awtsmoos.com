// B"H
// Boruch Hashem
// Blessed is He

const WorkerStats = require("./main-worker-stats.js");
const LaneStats = require("./main-lane-stats.js");
const Values = require("./main-state-values.js");

/**
 * @file Exposes bounded runtime pressure and connection-recovery truth.
 * @description
 * The Awtsmoos renews lane, worker, route, and reconnect testimony as one report.
 * Awtsmoos.com separates state creation from aggregation so every module remains
 * small enough to audit while snapshots reveal health without requester secrets.
 */
function createRuntimeState(dependencies) {
	const lagMonitor = dependencies.Lag.createLagMonitor({
		intervalMs: 2000,
		windowMs: 30000
	});
	const state = Values.createState(dependencies, lagMonitor);

	function totalInflight() {
		return LaneStats.totalInflight(dependencies, state);
	}

	function totalQueued() {
		return LaneStats.totalQueued(dependencies, state);
	}

	function stats(options = {}) {
		state.eventLoopLag = lagMonitor.snapshot();
		const lanes = LaneStats.laneStats(dependencies, state);
		const rawWorkers = dependencies.workers.status();
		const circuitInput = {
			lanes,
			eventLoopLag: state.eventLoopLag,
			workers: rawWorkers,
			lastSuccessfulActionAt: state.lastSuccessfulActionAt,
			maxQueue: dependencies.Limits.MAX_QUEUE
		};
		return {
			inflight: totalInflight(),
			queued: totalQueued(),
			maxInflight: dependencies.Limits.MAX_INFLIGHT,
			maxQueue: dependencies.Limits.MAX_QUEUE,
			controlQueueLimit: dependencies.Limits.CONTROL_QUEUE_LIMIT,
			lanes,
			eventLoopLag: state.eventLoopLag,
			circuit: dependencies.Circuit.snapshot(circuitInput),
			workers: WorkerStats.workerStats(rawWorkers, options.workers !== false),
			lastSuccessfulActionAt: state.lastSuccessfulActionAt,
			connection: Values.connectionSnapshot(state),
			longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
			keepAliveMs: dependencies.Limits.KEEPALIVE_MS
		};
	}

	function snapshot() {
		const memoryState = Values.memorySnapshotState(
			state,
			totalInflight(),
			totalQueued()
		);
		return {
			...dependencies.Memory.snapshot(
				memoryState,
				dependencies.Limits,
				dependencies.inlineLimit
			),
			...stats({ workers: true })
		};
	}

	return {
		lagMonitor,
		laneStats: () => LaneStats.laneStats(dependencies, state),
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
