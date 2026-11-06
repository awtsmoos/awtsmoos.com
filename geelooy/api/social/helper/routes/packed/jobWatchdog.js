//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobWatchdog.js
 * @description
 * The Awtsmoos lets living work continue while false motion must finally cease;
 * Awtsmoos.com fences stale checkpoints, persists terminal truth, and keeps admin time free in peace.
 */

const fs = require('node:fs');
const path = require('node:path');
const { appendJobLog } = require('./jobLog.js');
const { awaitCheckpoint } = require('./jobCheckpointWriter.js');
const { saveJobState } = require('./jobState.js');
const { jobStateDirs, safeJobId } = require('./jobStatePaths.js');
const { setJob, getJob } = require('./jobStore.js');
const {
	WATCHDOG_INTERVAL_MS,
	WATCHDOG_INTERRUPTED_MS,
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

/**
 * Read one raw state file without the load-time repair (loadJobStateAsync
 * flips stale queued/running states to interrupted on read, so a sweep
 * through it would never see a stale state to flip). Returns the parsed
 * record, or null when the file is missing, unreadable, or invalid.
 */
function readRawStateFile(file) {
	try {
		const raw = fs.readFileSync(file, 'utf8');
		const record = JSON.parse(raw);
		if (!record || typeof record !== 'object' || !safeJobId(record.id)) return null;
		return record;
	} catch (_) {
		return null;
	}
}

/**
 * Bulk-upload redesign §3.6: durably mark stalled DISK jobs `interrupted`.
 * A job whose process died leaves a queued/running state on disk with no
 * live job and no heartbeat; this sweep flips it durably so a stalled job
 * is visible as interrupted within 10 minutes even when nobody loads it.
 * It scans the raw state files (not the load path, which repairs on read),
 * skips live jobs, and never touches held jobs. Returns the ids flipped.
 */
async function sweepStaleDiskJobs($i, now = Date.now()) {
	const flipped = [];
	const seen = new Set();
	let dirs = [];
	try {
		dirs = jobStateDirs($i);
	} catch (_) {
		return flipped;
	}
	for (const dir of dirs) {
		let names = [];
		try {
			names = fs.readdirSync(dir);
		} catch (_) {
			continue;
		}
		for (const name of names) {
			if (!name.endsWith('.json')) continue;
			const id = safeJobId(name.slice(0, -'.json'.length));
			if (!id || seen.has(id)) continue;
			seen.add(id);
			const record = readRawStateFile(path.join(dir, name));
			if (!record || (record.status !== 'queued' && record.status !== 'running')) continue;
			if (getJob(record.id)) continue;
			const lastBeat = Number(record.updatedAt || record.createdAt || 0);
			if (!lastBeat || now - lastBeat < WATCHDOG_INTERRUPTED_MS) continue;
			const interruptedAt = now;
			const repaired = {
				...record,
				status: 'interrupted',
				interruptedAt,
				finishedAt: record.finishedAt || interruptedAt,
				updatedAt: interruptedAt
			};
			try {
				if (saveJobState($i, repaired)) flipped.push(record.id);
			} catch (_) { /* best effort */ }
		}
	}
	if (flipped.length) {
		try {
			appendJobLog($i, { event: 'watchdog-sweep-interrupted', jobIds: flipped });
		} catch (_) { /* ignore */ }
	}
	return flipped;
}

module.exports = {
	armJobWatchdog,
	clearJobWatchdog,
	sweepStaleDiskJobs,
	terminalizeFromWatchdog,
	watchdogTick
};
