//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobWatchdogPolicy.js
 * @description
 * The Awtsmoos transcends the ticking clock while every finite worker reveals a beat;
 * Awtsmoos.com separates pure liveness law from persistence, so policy stays clear and complete.
 */

const NO_HEARTBEAT_MS = 240000;
const WATCHDOG_INTERVAL_MS = 30000;

/** Preserve the inherited size-scaled execution ceiling for non-admin work only. */
function executionBudgetMs(job) {
	const total = Number(job?.totalPosts || job?.spec?.posts?.length || 0);
	return Math.min(3600000, 600000 + Math.max(0, total) * 2000);
}

/** Admin work is never failed merely because elapsed wall-clock time grew large. */
function jobBudgetExceeded(job, now = Date.now()) {
	if (!job || job.isAdmin || !job.startedAt) return false;
	const budget = Number(job.timeBudgetMs) || executionBudgetMs(job);
	return now - job.startedAt > budget;
}

/** A heartbeat measures cooperative runner liveness, not completed-post frequency. */
function workerHeartbeatStale(job, now = Date.now()) {
	if (!job?.startedAt) return false;
	const heartbeat = job.lastWorkerHeartbeatAt || job.startedAt;
	return now - heartbeat > NO_HEARTBEAT_MS;
}

/** Refresh liveness whenever a worker cycles or intentionally yields to pressure. */
function heartbeatJob(job, now = Date.now()) {
	job.lastWorkerHeartbeatAt = now;
	job.updatedAt = now;
}

/** Record completed-attempt progress while also refreshing the worker heartbeat. */
function markJobProgress(job, now = Date.now()) {
	job.lastProgressAt = now;
	heartbeatJob(job, now);
}

module.exports = {
	NO_HEARTBEAT_MS,
	WATCHDOG_INTERVAL_MS,
	executionBudgetMs,
	heartbeatJob,
	jobBudgetExceeded,
	markJobProgress,
	workerHeartbeatStale
};
