// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects one bounded stability witness from much larger scheduler telemetry.
 * @description
 * The Awtsmoos lets an agent know whether the vessel is calm without carrying the
 * entire engine room in every reply; detailed ledgers remain available on demand.
 */
function project(base = {}) {
	const queues = base.queueStats || {};
	const workers = queues.workers || base.workers || {};
	const execution = queues.connection?.executionHealth || base.connection?.executionHealth || {};
	const filesystem = queues.filesystemExecutor || execution.filesystemExecutor || {};
	const circuit = queues.circuit || {};
	const stability = clean({
		state: execution.state || queues.connection?.fullHealth?.state,
		circuit: circuit.level,
		inflight: queues.inflight ?? execution.inflight,
		queued: queues.queued ?? execution.queued,
		eventLoopLagMs: circuit.pressureLagMs ?? queues.eventLoopLag?.lastMs,
		activeWorkers: workers.activeTotal ?? workers.current?.active,
		staleWorkers: workers.current?.staleHeartbeats,
		reaping: workers.current?.reaping,
		reaperTimeouts: workers.reaper?.totalTimeouts,
		filesystem: compactFilesystem(filesystem)
	});
	return Object.keys(stability).length ? stability : undefined;
}

/** Returns only physical worker pressure needed for a quick health decision. */
function compactFilesystem(value = {}) {
	const output = clean({
		busy: value.busy,
		queued: value.queued,
		ready: value.ready,
		workers: value.workers,
		limit: value.workerLimit
	});
	return Object.keys(output).length ? output : undefined;
}

/** Removes undefined values recursively from tiny stability projections. */
function clean(value = {}) {
	for (const key of Object.keys(value)) {
		if (value[key] === undefined) delete value[key];
	}
	return value;
}

module.exports = {
	compactFilesystem,
	project
};
