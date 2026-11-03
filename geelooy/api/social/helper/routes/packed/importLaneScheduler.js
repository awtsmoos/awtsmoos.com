//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importLaneScheduler.js
 * @description
 * The Awtsmoos sends each job through memory, storage, and durable gates before motion begins;
 * Awtsmoos.com names a narrow vessel before accepting light, then frees safely sealed terminal input when motion ends.
 */

const { setJob, getJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { importLaneKeys, laneKeysIntersect } = require('./importLaneKeys.js');
const { inspectAdmission } = require('./importLaneAdmission.js');
const { inspectImportStorage } = require('./importStorageAdmission.js');
const { releaseTerminalJobPayload } = require('./terminalJobPayload.js');

const queue = [];
const active = new Map();

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
}

/** Return a specific capacity error if durable persistence raced with disk pressure. */
function persistenceFailure($i) {
	const storage = inspectImportStorage($i);
	if (storage.error) return storage;
	return {
		error: 'IMPORT_PERSIST_FAILED',
		message: 'The job could not be safely stored. Retry later.'
	};
}

/** Never acknowledge work before capacity and durable-state gates both pass. */
function scheduleImportJob($i, job, runner) {
	if (getJob(job.id)) {
		return { error: 'IMPORT_DUPLICATE_JOB', message: 'The specified job already exists.' };
	}
	const storage = inspectImportStorage($i);
	if (storage.error) return storage;
	const admission = inspectAdmission(job, queue, active);
	if (admission.error) return admission;
	job.status = 'queued';
	job.queuedAt = job.queuedAt || Date.now();
	if (!saveJobState($i, job)) return persistenceFailure($i);
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
		activeJobIds: [...active.keys()]
	};
}

/** Clear only isolated tests; production callers must never use this. */
function resetImportLanesForTest() {
	queue.length = 0;
	active.clear();
}

module.exports = { importLaneSnapshot, resetImportLanesForTest, scheduleImportJob };
