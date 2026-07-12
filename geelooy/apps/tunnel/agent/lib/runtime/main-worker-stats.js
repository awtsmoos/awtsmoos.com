// B"H

/** B"H — Worker truth is visible but bounded before it enters queue telemetry. */
function workerStats(input = {}, detailed = true) {
	const active = normalizeActive(input.active);
	const recent = Array.isArray(input.recent) ? input.recent : [];
	const out = {
		activeTotal: Number(input.activeTotal ?? Object.keys(active).length),
		activeLimit: Number(input.activeLimit || 0),
		activeTruncated: Boolean(input.activeTruncated),
		recentCompleted: input.recentCompleted || 0,
		recentFailed: input.recentFailed || 0,
		recentCancelled: input.recentCancelled || 0,
		recentLimit: Number(input.recentLimit || 0),
		supervisors: supervisorCount(input.supervisors)
	};
	if (!detailed) return out;
	return {
		...out,
		active: limitWorkerMap(active, 3),
		recent: recent.slice(0, 2).map(compactWorker)
	};
}

function normalizeActive(active) {
	if (Array.isArray(active)) {
		return Object.fromEntries(active.map((worker, index) => [worker.workerId || `worker-${index}`, worker]));
	}
	return active && typeof active === 'object' ? active : {};
}

function supervisorCount(supervisors) {
	if (Array.isArray(supervisors)) return supervisors.length;
	return supervisors && typeof supervisors === 'object' ? Object.keys(supervisors).length : 0;
}

function limitWorkerMap(active = {}, limit = 3) {
	return Object.fromEntries(
		Object.entries(active).slice(0, limit).map(([id, worker]) => [id, compactWorker(worker)])
	);
}

function compactWorker(worker = {}) {
	return {
		workerId: worker.workerId,
		jobId: worker.jobId,
		action: worker.action,
		state: worker.state,
		pid: worker.pid,
		startedAt: worker.startedAt,
		heartbeatAt: worker.heartbeatAt,
		heartbeatAgeMs: worker.heartbeatAgeMs,
		finishedAt: worker.finishedAt,
		exitCode: worker.exitCode,
		signal: worker.signal,
		cancelable: worker.cancelable
	};
}

module.exports = { compactWorker, limitWorkerMap, normalizeActive, workerStats };
