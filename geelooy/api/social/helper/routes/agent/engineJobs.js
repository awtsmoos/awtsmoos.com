//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineJobs
 * @description
 * Sibling of AgentTranslateEngine: job store and job processing, relocated verbatim.
 */

const { randomId } = require('./engineData.js');
const { translateText } = require('./engineTranslate.js');

// ---------------------------------------------------------------------------
// Jobs (AwtsmoosDB-backed batch translation jobs)
// ---------------------------------------------------------------------------

const JOBS_BASE = '/ikar/agentApi/jobs';

function createJobStore(db) {
	async function create(items, opts = {}) {
		const jobId = randomId('agentjob');
		const job = {
			jobId,
			status: 'queued',
			createdAt: Date.now(),
			updatedAt: Date.now(),
			byUserId: opts.byUserId || null,
			mode: opts.mode || 'scaffold',
			targetLang: opts.targetLang || 'en',
			total: items.length,
			done: 0,
			items: items.map((item, i) => ({ key: item.key || `item-${i}`, text: item.text })),
			results: []
		};
		await db.write(`${JOBS_BASE}/${jobId}`, job);
		return job;
	}
	async function get(jobId) {
		return db.get(`${JOBS_BASE}/${String(jobId)}`).catch(() => null);
	}
	async function update(job) {
		job.updatedAt = Date.now();
		await db.write(`${JOBS_BASE}/${job.jobId}`, job).catch(() => {});
		return job;
	}
	return { create, get, update };
}

/** Processes a batch job's items through the pipeline with bounded pacing. */
async function processJob(db, job, jobStore) {
	job.status = 'processing';
	await jobStore.update(job);
	for (let i = 0; i < job.items.length; i++) {
		const item = job.items[i];
		try {
			const result = await translateText(item.text, { mode: job.mode, targetLang: job.targetLang });
			job.results.push({ key: item.key, ok: !result.error, ...(result.ok || { error: result.error }) });
		} catch (e) {
			job.results.push({ key: item.key, ok: false, error: { code: 'ITEM_FAILED', message: String((e && e.message) || e) } });
		}
		job.done = i + 1;
		await jobStore.update(job);
	}
	job.status = 'done';
	await jobStore.update(job);
	return job;
}

module.exports = {
	createJobStore,
	processJob
};
