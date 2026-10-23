//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobWatchdog.js
 * @description
 * The Awtsmoos lets living work continue while false motion must finally cease;
 * Awtsmoos.com fences stale checkpoints, persists terminal truth, and keeps admin time free in peace.
 */

const { appendJobLog } = require('./jobLog.js');
const { awaitCheckpoint } = require('./jobCheckpointWriter.js');
const { saveJobState } = require('./jobState.js');
const { setJob } = require('./jobStore.js');
const {
	WATCHDOG_INTERVAL_MS,
	executionBudgetMs,
	heartbeatJob,
	jobBudgetExceeded,
	workerHeartbeatStale
} = require('./jobWatchdogPolicy.js');

/** Persist one watchdog terminal state only after older checkpoint writes settle. */
async function terminalizeFromWatchdog($i, job, status, message, event) {
	if (job.status !== 'running' || job._watchdogTerminalizing) return false;
	job._watchdogTerminalizing = true;
	job.status = status;
	job.updatedAt = Date.now();
	job.errors = Array.isArray(job.errors) ? job.errors : [];
	job.errors.push({ message });
	try {
		await awaitCheckpoint(job);
		setJob(job);
		saveJobState($i, job);
		appendJobLog($i, {
			jobId: job.id,
			event,
			postsDone: job.postsDone,
			isAdmin: !!job.isAdmin
		});
	} finally {
		job._watchdogTerminalizing = false;
	}
	return false;
}

/** Apply centralized budget and heartbeat liveness policy to one running job. */
async function watchdogTick($i, job, now = Date.now()) {
	if (job.status !== 'running') return false;
	if (jobBudgetExceeded(job, now)) {
		return terminalizeFromWatchdog(
			$i,
			job,
			'absolute-failure',
			'ABSOLUTE FAILURE: non-admin import exceeded its execution budget.',
			'watchdog-budget'
		);
	}
	if (workerHeartbeatStale(job, now)) {
		return terminalizeFromWatchdog(
			$i,
			job,
			'failed',
			'WATCHDOG_STALE_HEARTBEAT: cooperative worker heartbeat stopped.',
			'watchdog-stale-heartbeat'
		);
	}
	return true;
}

/** Start one liveness interval after live-hash preparation completes. */
function armJobWatchdog($i, job) {
	const now = Date.now();
	job.startedAt = now;
	job.lastProgressAt = now;
	heartbeatJob(job, now);
	job.timeBudgetMs = job.isAdmin ? null : executionBudgetMs(job);
	job._watchdogTimer = setInterval(() => {
		watchdogTick($i, job).catch(() => {});
	}, WATCHDOG_INTERVAL_MS);
	if (job._watchdogTimer.unref) job._watchdogTimer.unref();
	return job._watchdogTimer;
}

/** Clear the only watchdog timer owned by the centralized policy. */
function clearJobWatchdog(job) {
	if (!job?._watchdogTimer) return;
	clearInterval(job._watchdogTimer);
	job._watchdogTimer = null;
}

module.exports = {
	armJobWatchdog,
	clearJobWatchdog,
	terminalizeFromWatchdog,
	watchdogTick
};
