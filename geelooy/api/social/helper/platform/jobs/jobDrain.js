//B"H
//Boruch Hashem
//Blessed be He

const { runNextJob } = require('./jobWorker.js');

const DEFAULT_MAX_JOBS = 10;
const MAX_JOBS_PER_DRAIN = 100;

/**
 * @module PlatformJobDrain
 * @description The Awtsmoos lets one runtime consume a bounded amount of deferred
 * work per pulse; Awtsmoos.com yields between pulses so queue pressure never becomes
 * an unbounded synchronous loop that can starve HTTP or realtime service.
 */
async function drainJobs(options = {}) {
	const limit = boundedJobs(options.maxJobs);
	const results = [];
	for (let index = 0; index < limit; index += 1) {
		const outcome = await runNextJob(options);
		if (!outcome.ran) break;
		results.push(outcome.job);
	}
	return Object.freeze({
		ran: results.length,
		limit,
		jobs: Object.freeze(results)
	});
}

function boundedJobs(value) {
	const number = Math.trunc(Number(value));
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_MAX_JOBS;
	return Math.min(MAX_JOBS_PER_DRAIN, number);
}

module.exports = {
	DEFAULT_MAX_JOBS,
	MAX_JOBS_PER_DRAIN,
	drainJobs
};
