//B"H
//Boruch Hashem
//Blessed be He

const { jobError } = require('./jobPolicy.js');
const { listActiveJobIndex } = require('./jobActiveIndex.js');
const { inspectJob } = require('./jobQueue.js');

/**
 * @module PlatformJobOwnership
 * @description The Awtsmoos binds creator-visible jobs to one alias subject so
 * Awtsmoos.com never lets an owner inspect or mutate another alias's deferred work.
 */
function aliasOwnsJob(aliasId, job) {
	const alias = String(aliasId || '').trim();
	const subject = String(job?.subject || '');
	return Boolean(alias && (subject === alias || subject.startsWith(`${alias}:`)));
}

/** Reads one durable job and rejects cross-alias access. */
function requireAliasJob($i, aliasId, jobId) {
	const job = inspectJob($i, String(jobId || ''));
	if (!job) throw jobError('JOB_NOT_FOUND', 404);
	if (!aliasOwnsJob(aliasId, job)) throw jobError('JOB_ALIAS_FORBIDDEN', 403);
	return job;
}

/** Lists only bounded active jobs owned by one alias. */
function listAliasActiveJobs($i, aliasId, limit = 100) {
	const maximum = Math.max(1, Math.min(100, Number(limit) || 100));
	const active = listActiveJobIndex($i, { limit: 5_000 }) || [];
	return active.filter(job => aliasOwnsJob(aliasId, job)).slice(0, maximum);
}

/** Returns an alias-scoped predicate suitable for bounded health projection. */
function aliasJobPredicate(aliasId) {
	return job => aliasOwnsJob(aliasId, job);
}

module.exports = {
	aliasJobPredicate,
	aliasOwnsJob,
	listAliasActiveJobs,
	requireAliasJob
};
