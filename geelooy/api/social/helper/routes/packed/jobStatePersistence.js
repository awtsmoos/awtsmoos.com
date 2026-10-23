//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStatePersistence.js
 * @description
 * The Awtsmoos renews truth when a worker disappears from sight;
 * Awtsmoos.com seals interruption durably, so stale motion cannot pose as light.
 */

const fs = require('node:fs');
const path = require('node:path');
const { getJob } = require('./jobStore.js');
const { scheduleJobStateCleanup } = require('./postImportJobStateRetention.js');
const { jobStatePath, safeJobId } = require('./jobStatePaths.js');
const { jobStateShape } = require('./jobStateShape.js');

const ACTIVE_DISK_STATUSES = new Set(['queued', 'running']);
let temporarySequence = 0;

/** Give every atomic write a process-local unique temporary filename. */
function temporaryPath(filename, kind) {
	temporarySequence = (temporarySequence + 1) % Number.MAX_SAFE_INTEGER;
	return filename + '.' + kind + '-' + process.pid + '-' + temporarySequence;
}

/** Atomically persist one already-shaped record synchronously. */
function writeRecordSync($i, id, record) {
	const filename = jobStatePath($i, id);
	if (!filename) return false;
	const directory = path.dirname(filename);
	const temporary = temporaryPath(filename, 'savetmp');
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(temporary, JSON.stringify(record));
	fs.renameSync(temporary, filename);
	scheduleJobStateCleanup(directory);
	return true;
}

/** Atomically persist one already-shaped record without blocking file I/O. */
async function writeRecordAsync($i, id, record) {
	const filename = jobStatePath($i, id);
	if (!filename) return false;
	const directory = path.dirname(filename);
	const temporary = temporaryPath(filename, 'asynctmp');
	await fs.promises.mkdir(directory, { recursive: true });
	await fs.promises.writeFile(temporary, JSON.stringify(record));
	await fs.promises.rename(temporary, filename);
	scheduleJobStateCleanup(directory);
	return true;
}

/** Persist the bounded durable shape of one live job. */
function saveJobState($i, job) {
	try {
		return writeRecordSync($i, job?.id, jobStateShape(job));
	} catch (_) {
		return false;
	}
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

/** Load synchronously and durably repair a restart orphan when necessary. */
function loadJobState($i, id) {
	const safe = safeJobId(id);
	const filename = safe && jobStatePath($i, safe);
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
	const filename = safe && jobStatePath($i, safe);
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
	interruptedRecord,
	loadJobState,
	loadJobStateAsync,
	saveJobState,
	writeRecordAsync,
	writeRecordSync
};
