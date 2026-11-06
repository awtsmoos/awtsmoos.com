//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStatePersistence.js
 * @description
 * The Awtsmoos renews truth when a worker disappears from sight;
 * Awtsmoos.com seals interruption durably, so stale motion cannot pose as light.
 *
 * Bulk-upload redesign §3.3 (observability + job-store separation):
 * a persist exception is NEVER swallowed silently again — the cause
 * (message, code, path) is logged to the server log AND the job log,
 * and saveJobStateDetailed returns it as persistError so the scheduler
 * can refuse honestly instead of the bare IMPORT_PERSIST_FAILED.
 * Writes go to the resolved job store (off the data volume on
 * production); when the primary store fails, the legacy directory is
 * tried before any refusal, and the job is marked persistDegraded.
 * Reads check the primary store first, then the legacy directory, so
 * states written before the move stay readable (copy, don't move).
 */

const fs = require('node:fs');
const path = require('node:path');
const { getJob } = require('./jobStore.js');
const { scheduleJobStateCleanup } = require('./postImportJobStateRetention.js');
const { jobStateDirs, jobStatePath, jobStatePathForDir, safeJobId } = require('./jobStatePaths.js');
const { jobStateShape } = require('./jobStateShape.js');
const { appendJobLog } = require('./jobLog.js');

const ACTIVE_DISK_STATUSES = new Set(['queued', 'running']);
let temporarySequence = 0;

/** Give every atomic write a process-local unique temporary filename. */
function temporaryPath(filename, kind) {
	temporarySequence = (temporarySequence + 1) % Number.MAX_SAFE_INTEGER;
	return filename + '.' + kind + '-' + process.pid + '-' + temporarySequence;
}

/** Describe a thrown persist error without ever leaking a secret. */
function describePersistError(error, filename) {
	return {
		message: String((error && error.message) || error || 'unknown persist error'),
		code: (error && error.code) || null,
		path: filename || null
	};
}

/** Log a persist failure where an operator will actually see it. */
function logPersistError($i, id, error, filename) {
	const described = describePersistError(error, filename);
	try {
		console.error('[IMPORT-PERSIST-FAILED] job=' + id + ' code=' + (described.code || '?') + ' path=' + (described.path || '?') + ' message=' + described.message);
	} catch (_) { /* logging must never throw */ }
	try {
		appendJobLog($i, { jobId: id, event: 'persist-failed', ...described });
	} catch (_) { /* logging must never throw */ }
	return described;
}

/** Atomically persist one already-shaped record synchronously into one directory. */
function writeRecordIntoDir($i, dir, id, record) {
	const filename = jobStatePathForDir(dir, id);
	if (!filename) return { ok: false, error: describePersistError(new Error('invalid job id'), null) };
	const directory = path.dirname(filename);
	const temporary = temporaryPath(filename, 'savetmp');
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(temporary, JSON.stringify(record));
	fs.renameSync(temporary, filename);
	scheduleJobStateCleanup(directory);
	return { ok: true, filename };
}

/** Atomically persist one already-shaped record synchronously. */
function writeRecordSync($i, id, record) {
	const dirs = jobStateDirs($i);
	let lastError = null;
	for (const dir of dirs) {
		try {
			const done = writeRecordIntoDir($i, dir, id, record);
			if (done.ok) return true;
			lastError = done.error;
		} catch (error) {
			lastError = describePersistError(error, jobStatePathForDir(dir, id));
		}
	}
	logPersistError($i, id, lastError, lastError && lastError.path);
	return false;
}

/** Atomically persist one already-shaped record without blocking file I/O. */
async function writeRecordAsync($i, id, record) {
	const dirs = jobStateDirs($i);
	let lastError = null;
	for (const dir of dirs) {
		const filename = jobStatePathForDir(dir, id);
		if (!filename) continue;
		const directory = path.dirname(filename);
		const temporary = temporaryPath(filename, 'asynctmp');
		try {
			await fs.promises.mkdir(directory, { recursive: true });
			await fs.promises.writeFile(temporary, JSON.stringify(record));
			await fs.promises.rename(temporary, filename);
			scheduleJobStateCleanup(directory);
			return true;
		} catch (error) {
			lastError = describePersistError(error, filename);
		}
	}
	logPersistError($i, id, lastError, lastError && lastError.path);
	return false;
}

/** Persist the bounded durable shape of one live job. */
function saveJobState($i, job) {
	return saveJobStateDetailed($i, job).ok;
}

/**
 * Persist the bounded durable shape of one live job, returning the cause
 * on failure instead of a bare false: { ok, persistError?, degraded? }.
 * A job is refused only when BOTH the primary and the fallback store fail.
 */
function saveJobStateDetailed($i, job) {
	const id = job && job.id;
	if (!id || !safeJobId(id)) {
		return { ok: false, persistError: { message: 'invalid job id', code: null, path: null } };
	}
	let body;
	try {
		body = jobStateShape(job);
	} catch (error) {
		const described = logPersistError($i, id, error, null);
		return { ok: false, persistError: described };
	}
	const dirs = jobStateDirs($i);
	let lastError = null;
	for (let index = 0; index < dirs.length; index++) {
		const dir = dirs[index];
		const filename = jobStatePathForDir(dir, id);
		if (!filename) continue;
		try {
			const directory = path.dirname(filename);
			const temporary = temporaryPath(filename, 'savetmp');
			fs.mkdirSync(directory, { recursive: true });
			fs.writeFileSync(temporary, JSON.stringify(body));
			fs.renameSync(temporary, filename);
			scheduleJobStateCleanup(directory);
			if (index > 0) {
				try { job.persistDegraded = true; } catch (_) { /* ignore */ }
				try {
					appendJobLog($i, { jobId: id, event: 'persist-degraded', primaryFailed: true, fallbackDir: dir });
				} catch (_) { /* ignore */ }
			}
			return { ok: true, degraded: index > 0 };
		} catch (error) {
			lastError = describePersistError(error, filename);
		}
	}
	const described = logPersistError($i, id, lastError, lastError && lastError.path);
	return { ok: false, persistError: described };
}

/** Convert an orphaned disk-active state into terminal restart truth. */
function interruptedRecord(id, raw) {
	if (!ACTIVE_DISK_STATUSES.has(raw?.status) || getJob(id)) return raw;
	const interruptedAt = raw.interruptedAt || Date.now();
	return {
		...raw,
		status: 'interrupted',
		interruptedAt,
		finishedAt: raw.finishedAt || interruptedAt
	};
}

/** Find the state file for one job id across the primary and legacy stores. */
function findStateFile($i, id) {
	const safe = safeJobId(id);
	if (!safe) return null;
	for (const dir of jobStateDirs($i)) {
		const filename = jobStatePathForDir(dir, safe);
		try {
			if (filename && fs.existsSync(filename)) return filename;
		} catch (_) { /* try next dir */ }
	}
	return null;
}

/** Load synchronously and durably repair a restart orphan when necessary. */
function loadJobState($i, id) {
	const safe = safeJobId(id);
	const filename = safe && findStateFile($i, safe);
	if (!filename) return null;
	try {
		const raw = JSON.parse(fs.readFileSync(filename, 'utf8'));
		const repaired = interruptedRecord(safe, raw);
		if (repaired !== raw) writeRecordSync($i, safe, repaired);
		return repaired;
	} catch (_) {
		return null;
	}
}

/** Load asynchronously and durably repair a restart orphan when necessary. */
async function loadJobStateAsync($i, id) {
	const safe = safeJobId(id);
	const filename = safe && findStateFile($i, safe);
	if (!filename) return null;
	try {
		const raw = JSON.parse(await fs.promises.readFile(filename, 'utf8'));
		const repaired = interruptedRecord(safe, raw);
		if (repaired !== raw) await writeRecordAsync($i, safe, repaired);
		return repaired;
	} catch (_) {
		return null;
	}
}

module.exports = {
	ACTIVE_DISK_STATUSES,
	describePersistError,
	findStateFile,
	interruptedRecord,
	loadJobState,
	loadJobStateAsync,
	logPersistError,
	saveJobState,
	saveJobStateDetailed,
	writeRecordAsync,
	writeRecordSync
};
