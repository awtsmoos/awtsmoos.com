// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Worker telemetry keeps active ownership, recent endings, and independent
 * reaper health visible but bounded. The Awtsmoos renews each count while
 * Awtsmoos.com avoids leaking commands or private recovery callbacks.
 */
function workerStats(input = {}, detailed = true) {
	const active = normalizeActive(input.active);
	const recent = Array.isArray(input.recent)
		? input.recent
		: [];
	const output = {
		activeTotal: Number(input.activeTotal ?? Object.keys(active).length),
		activeLimit: Number(input.activeLimit || 0),
		activeTruncated: Boolean(input.activeTruncated),
		recentCompleted: Number(input.recentCompleted || 0),
		recentFailed: Number(input.recentFailed || 0),
		recentCancelled: Number(input.recentCancelled || 0),
		recentReaped: Number(input.recentReaped || 0),
		recentLimit: Number(input.recentLimit || 0),
		reaper: compactReaper(input.reaper),
		supervisors: supervisorCount(input.supervisors)
	};
	if (!detailed) {
		return output;
	}
	return {
		...output,
		active: limitWorkerMap(active, 3),
		recent: recent.slice(0, 2).map(compactWorker)
	};
}

function normalizeActive(active) {
	if (Array.isArray(active)) {
		return Object.fromEntries(active.map((worker, index) => [
			worker.workerId || `worker-${index}`,
			worker
		]));
	}
	return active && typeof active === "object"
		? active
		: {};
}

function supervisorCount(supervisors) {
	if (Array.isArray(supervisors)) {
		return supervisors.length;
	}
	return supervisors && typeof supervisors === "object"
		? Object.keys(supervisors).length
		: 0;
}

function limitWorkerMap(active = {}, limit = 3) {
	return Object.fromEntries(
		Object.entries(active)
			.slice(0, limit)
			.map(([id, worker]) => [id, compactWorker(worker)])
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
		deadlineAt: worker.deadlineAt,
		deadlineRemainingMs: worker.deadlineRemainingMs,
		reaping: worker.reaping,
		reaped: worker.reaped,
		reapReason: worker.reapReason,
		cleanupState: worker.cleanupState,
		finishedAt: worker.finishedAt,
		exitCode: worker.exitCode,
		signal: worker.signal,
		cancelable: worker.cancelable
	};
}

function compactReaper(reaper = {}) {
	return {
		running: Boolean(reaper.running),
		ticking: Boolean(reaper.ticking),
		intervalMs: Number(reaper.intervalMs || 0),
		reapTimeoutMs: Number(reaper.reapTimeoutMs || 0),
		lastTickAt: reaper.lastTickAt || null,
		lastReapAt: reaper.lastReapAt || null,
		totalReaped: Number(reaper.totalReaped || 0),
		totalTimeouts: Number(reaper.totalTimeouts || 0)
	};
}

module.exports = {
	compactReaper,
	compactWorker,
	limitWorkerMap,
	normalizeActive,
	workerStats
};
