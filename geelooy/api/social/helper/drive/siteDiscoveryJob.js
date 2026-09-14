//B"H
//Boruch Hashem
//Blessed be He

const { submitJob } = require('../platform/jobs/jobQueue.js');
const { drainJobs } = require('../platform/jobs/jobDrain.js');
const { runNextJob } = require('../platform/jobs/jobWorker.js');
const { recordSiteDeploymentDiscovery } = require('./siteDiscoveryRecord.js');

const SITE_DISCOVERY_QUEUE = 'site-discovery';
const SITE_DISCOVERY_TYPE = 'site.discovery';

/**
 * @module SiteDiscoveryJob
 * @description The Awtsmoos turns optional Site discovery projection into durable,
 * idempotent work so Awtsmoos.com may publish first and index afterward.
 */
async function enqueueSiteDiscovery(options = {}) {
	const aliasId = required(options.aliasId, 'aliasId');
	const siteId = required(options.siteId, 'siteId');
	const deploymentId = required(options.deploymentId, 'deploymentId');
	return submitJob({
		$i: options.$i,
		queue: SITE_DISCOVERY_QUEUE,
		type: SITE_DISCOVERY_TYPE,
		subject: `${aliasId}:${siteId}`,
		idempotencyKey: `${aliasId}:${siteId}:${deploymentId}`,
		maxAttempts: 5,
		priority: 3,
		payload: { aliasId, siteId, deploymentId }
	});
}

async function runSiteDiscoveryWorker(options = {}) {
	return runNextJob(workerOptions(options));
}

/** Drains a bounded number of discovery jobs without monopolizing the event loop. */
async function drainSiteDiscoveryJobs(options = {}) {
	return drainJobs({ ...workerOptions(options), maxJobs: options.maxJobs });
}

function workerOptions(options) {
	return {
		$i: options.$i,
		queue: SITE_DISCOVERY_QUEUE,
		workerId: options.workerId || `site-discovery-${process.pid}`,
		timeoutMs: 15_000,
		handlers: siteDiscoveryHandlers(options.$i)
	};
}

function siteDiscoveryHandlers($i) {
	return {
		[SITE_DISCOVERY_TYPE]: async ({ payload }) => {
			const recorded = await recordSiteDeploymentDiscovery({ ...payload, $i });
			if (!recorded) {
				const error = new Error('SITE_DISCOVERY_NOT_RECORDED');
				error.code = 'SITE_DISCOVERY_NOT_RECORDED';
				throw error;
			}
			return { recorded: true, deploymentId: payload.deploymentId };
		}
	};
}

async function enqueueAndRunSiteDiscovery(options = {}) {
	const queued = await enqueueSiteDiscovery(options);
	const outcome = await runSiteDiscoveryWorker(options);
	return Object.freeze({ queued, outcome });
}

function required(value, label) {
	const text = String(value || '').trim();
	if (!text) throw new TypeError(`${label} is required.`);
	return text;
}

module.exports = {
	SITE_DISCOVERY_QUEUE,
	SITE_DISCOVERY_TYPE,
	drainSiteDiscoveryJobs,
	enqueueAndRunSiteDiscovery,
	enqueueSiteDiscovery,
	runSiteDiscoveryWorker,
	siteDiscoveryHandlers
};
