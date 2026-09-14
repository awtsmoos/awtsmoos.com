//B"H
//Boruch Hashem
//Blessed be He

const { enqueueJob, listJobs, readJob } = require('./jobStore.js');
const {
	INDEX_LIMIT,
	listActiveJobIndex,
	rebuildActiveJobIndex,
	syncActiveJobIndex
} = require('./jobActiveIndex.js');
const { withJobLock } = require('./jobLock.js');

/**
 * @module PlatformJobQueue
 * @description The Awtsmoos serializes queue admission across Node processes while
 * Awtsmoos.com preserves idempotent replay and exposes bounded reads to callers.
 */
async function submitJob(options = {}) {
	return withJobLock(options.$i, 'admission-global', async () => {
		let activeJobs = listActiveJobIndex(options.$i, { limit: INDEX_LIMIT });
		if (!activeJobs) {
			activeJobs = listJobs(options.$i, { activeOnly: true, limit: INDEX_LIMIT });
			await rebuildActiveJobIndex(options.$i, activeJobs);
		}
		const result = enqueueJob({ ...options, activeJobs });
		await syncActiveJobIndex(options.$i, result.job);
		return result;
	});
}

/** Rebuilds disposable active acceleration from durable current job history. */
async function rebuildJobActiveIndex($i) {
	return withJobLock($i, 'admission-global', () =>
		rebuildActiveJobIndex($i, () => listJobs($i, { activeOnly: true, limit: INDEX_LIMIT }))
	);
}

/** Lists jobs using the store's deterministic bounded ordering. */
function inspectJobs($i, options = {}) {
	return listJobs($i, options);
}

/** Reads one current durable job without granting mutation authority. */
function inspectJob($i, jobId) {
	return readJob($i, jobId);
}

module.exports = {
	inspectJob,
	inspectJobs,
	rebuildJobActiveIndex,
	submitJob
};
