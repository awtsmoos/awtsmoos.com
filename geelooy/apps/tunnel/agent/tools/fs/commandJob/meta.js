// B"H
const Paths = require('./paths.js');
const Policy = require('./policy.js');

const writeLocks = new Map();

/**
 * B"H — Metadata writes are serialized per job. Once terminal truth is written,
 * no late heartbeat, identity observation, or close callback may resurrect it.
 */
async function read(config, jobId) {
	return Paths.readJson(Paths.file(config, jobId, 'meta.json'), null);
}

function write(config, jobId, meta, options = {}) {
	const key = Paths.file(config, jobId, 'meta.json');
	const previous = writeLocks.get(key) || Promise.resolve();
	const task = previous
		.catch(() => {})
		.then(() => commit(config, jobId, meta, options));
	writeLocks.set(key, task);
	task.finally(() => {
		if (writeLocks.get(key) === task) writeLocks.delete(key);
	}).catch(() => {});
	return task;
}

async function commit(config, jobId, meta, options = {}) {
	const current = await read(config, jobId);
	if (current && Policy.TERMINAL.has(current.status)) {
		if (!Policy.TERMINAL.has(meta.status) || current.status !== meta.status) {
			return current;
		}
	}
	const currentRevision = Number(current?.revision || 0);
	if (options.expectedRevision !== undefined &&
		currentRevision !== Number(options.expectedRevision)) {
		throw revisionConflict(currentRevision, options.expectedRevision);
	}
	const next = {
		...meta,
		schemaVersion: Number(meta.schemaVersion || 2),
		revision: current ? currentRevision + 1 : Number(meta.revision || 0),
		updatedAt: new Date().toISOString()
	};
	await Paths.writeJson(Paths.file(config, jobId, 'meta.json'), next);
	return next;
}

function revisionConflict(currentRevision, expectedRevision) {
	const error = new Error('command_metadata_revision_conflict');
	error.code = 'command_metadata_revision_conflict';
	error.currentRevision = currentRevision;
	error.expectedRevision = expectedRevision;
	return error;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { commit, read, sleep, write };
