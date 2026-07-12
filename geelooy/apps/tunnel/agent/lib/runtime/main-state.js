// B"H
const WorkerStats = require('./main-worker-stats.js');

/**
 * B"H — Runtime truth is one bounded snapshot. Replacement ownership is explicit
 * so an older agent cannot wander back into reconnect after yielding its name.
 */
function createRuntimeState(dependencies) {
	const lagMonitor = dependencies.Lag.createLagMonitor({ intervalMs: 2000, windowMs: 30000 });
	const state = createState(dependencies, lagMonitor);

	function totalInflight() {
		return dependencies.Priority.inflightCount(state.lanes);
	}

	function totalQueued() {
		return dependencies.Priority.queuedCount(state.lanes);
	}

	function laneStats() {
		return Object.fromEntries(dependencies.Priority.LANE_ORDER.map(lane => [lane, {
			inflight: state.lanes[lane].inflight,
			queued: state.lanes[lane].queue.length,
			maxInflight: dependencies.Limits.LANE_LIMITS[lane],
			advisoryTimeoutMs: dependencies.Limits.LANE_TIMEOUT_MS[lane]
		}]));
	}

	function stats(options = {}) {
		state.eventLoopLag = lagMonitor.snapshot();
		const lanes = laneStats();
		const rawWorkers = dependencies.workers.status();
		const base = {
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
			circuit: dependencies.Circuit.snapshot(base),
			workers: WorkerStats.workerStats(rawWorkers, options.workers !== false),
			lastSuccessfulActionAt: state.lastSuccessfulActionAt,
			replacementRequested: state.replacementRequested,
			longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
			keepAliveMs: dependencies.Limits.KEEPALIVE_MS
		};
	}

	function snapshot() {
		const memoryState = {
			inflight: new Set(Array(totalInflight()).fill(0)),
			requestQueue: Array(totalQueued()).fill(0),
			reconnectAttempt: state.reconnectAttempt,
			wasEverConnected: state.wasEverConnected
		};
		return {
			...dependencies.Memory.snapshot(memoryState, dependencies.Limits, dependencies.inlineLimit),
			...stats({ workers: true })
		};
	}

	return { lagMonitor, laneStats, snapshot, state, stats, totalInflight, totalQueued };
}

function createState(dependencies, lagMonitor) {
	return {
		activeWs: null,
		reconnectTimer: null,
		watchdogTimer: null,
		drainScheduled: false,
		reconnectAttempt: 0,
		wasEverConnected: false,
		replacementRequested: false,
		generation: 0,
		lastSuccessfulActionAt: 0,
		lanes: dependencies.Priority.makeLaneState(),
		eventLoopLag: lagMonitor.snapshot()
	};
}

module.exports = { createRuntimeState, createState };
