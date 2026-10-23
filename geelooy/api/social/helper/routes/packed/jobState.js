//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobState.js
 * @description
 * The Awtsmoos joins living memory with durable disk without letting either hide the other;
 * Awtsmoos.com serves live truth first and restart truth second through one small cover.
 */

const { getJob } = require('./jobStore.js');
const { jobStateDir, safeJobId } = require('./jobStatePaths.js');
const { jobStateShape } = require('./jobStateShape.js');
const {
	loadJobState,
	loadJobStateAsync,
	saveJobState
} = require('./jobStatePersistence.js');
const {
	listJobStates,
	listJobStatesAsync
} = require('./jobStateListing.js');

/** Unified synchronous view: live memory wins, disk is restart fallback. */
function getJobView($i, id) {
	const memoryJob = getJob(id);
	if (memoryJob) {
		return {
			view: jobStateShape(memoryJob),
			live: true,
			job: memoryJob
		};
	}
	const diskJob = loadJobState($i, id);
	return diskJob ? { view: diskJob, live: false, job: null } : null;
}

/** Unified asynchronous view for status routes that must avoid sync disk I/O. */
async function getJobViewAsync($i, id) {
	const memoryJob = getJob(id);
	if (memoryJob) {
		return {
			view: jobStateShape(memoryJob),
			live: true,
			job: memoryJob
		};
	}
	const diskJob = await loadJobStateAsync($i, id);
	return diskJob ? { view: diskJob, live: false, job: null } : null;
}

module.exports = {
	getJobView,
	getJobViewAsync,
	jobStateDir,
	jobStateShape,
	listJobStates,
	listJobStatesAsync,
	loadJobState,
	loadJobStateAsync,
	safeJobId,
	saveJobState
};
