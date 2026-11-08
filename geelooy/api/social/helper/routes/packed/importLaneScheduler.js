//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importLaneScheduler.js
 * @description
 * The Awtsmoos sends each job through memory, storage, and durable gates before motion begins;
 * Awtsmoos.com names a narrow vessel before accepting light, then frees safely sealed terminal input when motion ends.
 *
 * Bulk-upload redesign §3.3/§3.4 — two gates, not one:
 *  - RECORD gate (job store, 500 MB floor): the job must be durably
 *    recorded before it is acknowledged. Only when BOTH the primary
 *    and the fallback store fail is the job refused, and the refusal
 *    carries the real persistError — never the bare IMPORT_PERSIST_FAILED.
 *  - DATA gate (data volume, 8 GiB floor kept): when free space is below
 *    the floor the job is admitted as HELD — durable, visible in
 *    posts/jobs, auto-started by the watcher once free space clears
 *    the floor + 1 GiB hysteresis — instead of being refused.
 * The proven stability limits stay: 2 lanes, 1 job per heichel,
 * disjoint series, queue ≤ 24 jobs.
 */

const { setJob, getJob } = require('./jobStore.js');
const { saveJobState, saveJobStateDetailed } = require('./jobState.js');
const { appendJobLog } = require('./jobLog.js');
const { importLaneKeys, laneKeysIntersect } = require('./importLaneKeys.js');
const { inspectAdmission } = require('./importLaneAdmission.js');
const { inspectImportStorage, importStorageReadyForHeld } = require('./importStorageAdmission.js');
const { releaseTerminalJobPayload } = require('./terminalJobPayload.js');

const queue = [];
const active = new Map();
const held = [];
let heldWatcherTimer = null;
let heldWatcherContext = null;

const HELD_WATCH_INTERVAL_MS = 10000;

/** Limit concurrent executions to the host's configured capacity. */
function laneLimit() {
	return Math.max(1, Math.min(4, Number(process.env.AWTSMOOS_IMPORT_LANES) || 2));
}

/** Run only disjoint series inside the available execution lanes. */
function canRun(entry) {
	if (active.size >= laneLimit()) return false;
	for (const running of active.values()) {
		if (laneKeysIntersect(entry.keys, running.keys)) return false;
	}
	return true;
}

/** Turn an unexpected runner error into a durable terminal status. */
function failJob($i, job, error) {
	if (job.status !== 'queued' && job.status !== 'running') return;
	job.status = 'failed';
	job.finishedAt = Date.now();
	job.updatedAt = job.finishedAt;
	job.errors = Array.isArray(job.errors) ? job.errors : [];
	job.errors.push({ message: 'IMPORT_RUNNER_FAILED: ' + (error?.message || error || 'unknown error') });
	setJob(job);
	const persisted = saveJobState($i, job);
	if (persisted) releaseTerminalJobPayload(job);
}

/** Preserve existing fair compatibility checks while draining the queue. */
function drain() {
	let started = true;
	while (started && active.size < laneLimit()) {
		started = false;
		for (let index = 0; index < queue.length; index++) {
			const entry = queue[index];
			if (!canRun(entry)) continue;
			queue.splice(index, 1);
			active.set(entry.job.id, entry);
			started = true;
			Promise.resolve()
				.then(() => entry.runner())
				.catch(error => failJob(entry.$i, entry.job, error))
				.finally(() => {
					active.delete(entry.job.id);
					drain();
				});
			break;
		}
	}
	if (held.length) maybeReleaseHeld();
}

/** Return a specific capacity error if durable persistence raced with disk pressure. */
function persistenceFailure($i, persistError) {
	const storage = inspectImportStorage($i);
	if (storage.error) return { ...storage, persistError: persistError || null };
	return {
		error: 'IMPORT_PERSIST_FAILED',
		message: 'The job could not be safely stored. Retry later.',
		retryable: true,
		retryAfterMs: 30000,
		persistError: persistError || null
	};
}

/** Admit one held entry into the live queue now that space is restored. */
function admitHeldEntry(entry) {
	const { $i, job } = entry;
	job.status = 'queued';
	job.holdReason = undefined;
	job.holdFreeBytes = undefined;
	job.heldAt = undefined;
	job.updatedAt = Date.now();
	const saved = saveJobStateDetailed($i, job);
	if (!saved.ok) {
		job.status = 'held';
		job.holdReason = 'IMPORT_PERSIST_FAILED';
		job.updatedAt = Date.now();
		saveJobState($i, job);
		return false;
	}
	setJob(job);
	queue.push(entry);
	drain();
	return true;
}

/** Release every held job when the data volume has cleared the floor + hysteresis. */
function maybeReleaseHeld() {
	if (!held.length) return 0;
	const $i = held[0].$i;
	if (!importStorageReadyForHeld($i)) return 0;
	let released = 0;
	const stillHeld = [];
	for (const entry of held.splice(0, held.length)) {
		if (admitHeldEntry(entry)) released++;
		else stillHeld.push(entry);
	}
	if (stillHeld.length) held.push(...stillHeld);
	if (released) {
		try {
			appendJobLog($i, { event: 'held-released', released, stillHeld: stillHeld.length });
		} catch (_) { /* ignore */ }
	}
	return released;
}

/** Start the held-job watcher (idempotent, unref'd — never keeps the process alive). */
function startHeldWatcher($i) {
	if (heldWatcherTimer) {
		if ($i) heldWatcherContext = $i;
		return heldWatcherTimer;
	}
	heldWatcherContext = $i || null;
	heldWatcherTimer = setInterval(() => {
		try {
			maybeReleaseHeld();
		} catch (_) { /* the watcher must never throw */ }
	}, HELD_WATCH_INTERVAL_MS);
	if (heldWatcherTimer.unref) heldWatcherTimer.unref();
	return heldWatcherTimer;
}

/** Held jobs currently waiting for disk space (ids only, for status/inspection). */
function heldJobSnapshot() {
	return held.map(entry => ({
		id: entry.job.id,
		holdReason: entry.job.holdReason,
		holdFreeBytes: entry.job.holdFreeBytes,
		heldAt: entry.job.heldAt
	}));
}

/** Remove one held job from the held queue (cancel path). Returns true when removed. */
function removeHeldJob(jobId) {
	const index = held.findIndex(entry => entry.job.id === jobId);
	if (index < 0) return false;
	held.splice(index, 1);
	return true;
}

/** Never acknowledge work before capacity and durable-state gates both pass. */
function scheduleImportJob($i, job, runner) {
	if (getJob(job.id)) {
		return { error: 'IMPORT_DUPLICATE_JOB', message: 'The specified job already exists.' };
	}
	const admission = inspectAdmission(job, queue, active);
	if (admission.error) return { ...admission, retryable: false };
	// DATA gate first for the held decision — but the RECORD gate decides
	// the refusal. A job is held (durable, visible) when the data volume
	// is low; it is refused only when its state cannot be recorded.
	const storage = inspectImportStorage($i);
	if (storage.error) {
		job.status = 'held';
		job.heldAt = Date.now();
		job.queuedAt = job.queuedAt || job.heldAt;
		job.holdReason = storage.error;
		job.holdFreeBytes = storage.freeBytes;
		job.updatedAt = job.heldAt;
		const saved = saveJobStateDetailed($i, job);
		if (!saved.ok) return persistenceFailure($i, saved.persistError);
		setJob(job);
		held.push({ $i, job, runner, keys: importLaneKeys(job), bytes: admission.bytes || 0 });
		startHeldWatcher($i);
		return {
			held: true,
			status: 'held',
			holdReason: storage.error,
			freeBytes: storage.freeBytes,
			minimumFreeBytes: storage.minimumFreeBytes,
			retryable: true,
			retryAfterMs: storage.retryAfterMs || 60000,
			message: 'Import storage is below the safe free-space floor; the job is held and will start automatically when space is restored.'
		};
	}
	job.status = 'queued';
	job.queuedAt = job.queuedAt || Date.now();
	const saved = saveJobStateDetailed($i, job);
	if (!saved.ok) return persistenceFailure($i, saved.persistError);
	setJob(job);
	const entry = { $i, job, runner, keys: importLaneKeys(job), bytes: admission.bytes };
	queue.push(entry);
	drain();
	return { queued: true, position: queue.indexOf(entry) + 1, active: active.size };
}

/** Reveal bounded scheduler counts without mutating its internal queues. */
function importLaneSnapshot() {
	return {
		limit: laneLimit(),
		active: active.size,
		queued: queue.length,
		held: held.length,
		activeJobIds: [...active.keys()],
		heldJobIds: held.map(entry => entry.job.id)
	};
}

/** Clear only isolated tests; production callers must never use this. */
function resetImportLanesForTest() {
	queue.length = 0;
	active.clear();
	held.length = 0;
	if (heldWatcherTimer) {
		clearInterval(heldWatcherTimer);
		heldWatcherTimer = null;
	}
	heldWatcherContext = null;
}

module.exports = {
	admitHeldEntry,
	heldJobSnapshot,
	held,
	importLaneSnapshot,
	maybeReleaseHeld,
	removeHeldJob,
	resetImportLanesForTest,
	scheduleImportJob,
	startHeldWatcher
};
