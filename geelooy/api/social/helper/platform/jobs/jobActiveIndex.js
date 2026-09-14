//B"H
//Boruch Hashem
//Blessed be He

const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { resolveDbRoot } = require('../../packed/socialPacked.js');
const { activeJob } = require('./jobPolicy.js');
const { withJobLock } = require('./jobLock.js');

const INDEX_KIND = 'awtsmoos-active-job-index-v1';
const INDEX_LIMIT = 5_000;

/**
 * @module PlatformJobActiveIndex
 * @description The Awtsmoos keeps one bounded snapshot of active queue testimony;
 * Awtsmoos.com worker polling depends on current pressure instead of all historical
 * audit records while append-only job history remains the durable authority.
 */
function activeIndexPath($i) {
	const root = path.resolve(String($i?.db?.directory || resolveDbRoot($i) || ''));
	return path.join(root, 'social', 'platform-jobs', 'active-v1.json');
}

/** Reads the bounded acceleration snapshot or null when it must be rebuilt. */
function readActiveJobIndex($i) {
	try {
		const parsed = JSON.parse(fs.readFileSync(activeIndexPath($i), 'utf8'));
		if (parsed?.kind !== INDEX_KIND || !Array.isArray(parsed.jobs)) return null;
		return parsed.jobs.slice(0, INDEX_LIMIT);
	} catch (error) {
		if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
		throw error;
	}
}

/** Returns bounded active entries for admission or one queue's worker scan. */
function listActiveJobIndex($i, options = {}) {
	const jobs = readActiveJobIndex($i);
	if (!jobs) return null;
	const limit = boundedLimit(options.limit, 100, INDEX_LIMIT);
	return jobs
		.filter(job => !options.queue || job.queue === options.queue)
		.sort(compareEntries)
		.slice(0, limit);
}

/** Adds, refreshes, or removes one job under a cross-process index lock. */
async function syncActiveJobIndex($i, job) {
	return withJobLock($i, 'active-index-v1', async () => {
		const current = readActiveJobIndex($i) || [];
		const byId = new Map(current.map(entry => [entry.id, entry]));
		if (activeJob(job)) byId.set(job.id, indexEntry(job));
		else byId.delete(job?.id);
		const jobs = [...byId.values()].sort(compareEntries).slice(0, INDEX_LIMIT);
		writeIndex($i, jobs);
		return jobs.length;
	});
}

/** Rebuilds acceleration state from authoritative current job records. */
async function rebuildActiveJobIndex($i, jobs = []) {
	return withJobLock($i, 'active-index-v1', async () => {
		const values = typeof jobs === 'function' ? await jobs() : jobs;
		const active = values.filter(activeJob).map(indexEntry).sort(compareEntries).slice(0, INDEX_LIMIT);
		writeIndex($i, active);
		return active.length;
	});
}

function indexEntry(job) {
	return Object.freeze({
		kind: job.kind,
		id: job.id,
		queue: job.queue,
		type: job.type,
		subject: job.subject || null,
		status: job.status,
		priority: Number(job.priority || 0),
		availableAt: Number(job.availableAt || 0),
		createdAt: Number(job.createdAt || 0),
		leaseExpiresAt: Number(job.lease?.expiresAt || 0)
	});
}

function writeIndex($i, jobs) {
	const file = activeIndexPath($i);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
	const value = { kind: INDEX_KIND, updatedAt: Date.now(), jobs };
	fs.writeFileSync(temporary, `${JSON.stringify(value)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
}

function compareEntries(left, right) {
	return Number(right.priority || 0) - Number(left.priority || 0)
		|| Number(left.availableAt || 0) - Number(right.availableAt || 0)
		|| Number(left.createdAt || 0) - Number(right.createdAt || 0)
		|| String(left.id).localeCompare(String(right.id));
}

function boundedLimit(value, fallback, maximum) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0 ? Math.min(maximum, number) : fallback;
}

module.exports = {
	INDEX_LIMIT,
	activeIndexPath,
	listActiveJobIndex,
	readActiveJobIndex,
	rebuildActiveJobIndex,
	syncActiveJobIndex
};
