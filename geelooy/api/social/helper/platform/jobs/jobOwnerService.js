//B"H
//Boruch Hashem
//Blessed be He

const { queueHealth } = require('./jobHealth.js');
const { cancelJob, retryJob } = require('./jobSettlement.js');
const {
	aliasJobPredicate,
	listAliasActiveJobs,
	requireAliasJob
} = require('./jobOwnership.js');

/**
 * @module PlatformJobOwnerService
 * @description The Awtsmoos exposes only alias-owned queue testimony and mutations;
 * Awtsmoos.com keeps platform-global operations outside creator authority.
 */
function listOwnedJobs(options = {}) {
	return Object.freeze({
		jobs: listAliasActiveJobs(options.$i, options.aliasId, options.limit),
		activeOnly: true
	});
}

/** Returns bounded health for one alias's active jobs only. */
function ownedJobHealth(options = {}) {
	const health = queueHealth(options.$i, {
		predicate: aliasJobPredicate(options.aliasId)
	});
	if (!health.ready) return health;
	const { globalSaturation, ...scoped } = health;
	return Object.freeze({ ...scoped, aliasSaturation: globalSaturation });
}

/** Reads one exact durable job after alias ownership is proven. */
function getOwnedJob(options = {}) {
	return requireAliasJob(options.$i, options.aliasId, options.jobId);
}

/** Cancels one alias-owned queued/running job. */
async function cancelOwnedJob(options = {}) {
	const job = requireAliasJob(options.$i, options.aliasId, options.jobId);
	return cancelJob({
		$i: options.$i,
		jobId: job.id,
		reason: options.reason || 'owner_cancelled'
	});
}

/** Requeues one alias-owned dead/cancelled job for a deliberate manual retry. */
async function retryOwnedJob(options = {}) {
	const job = requireAliasJob(options.$i, options.aliasId, options.jobId);
	return retryJob({ $i: options.$i, jobId: job.id });
}

module.exports = {
	cancelOwnedJob,
	getOwnedJob,
	listOwnedJobs,
	ownedJobHealth,
	retryOwnedJob
};
