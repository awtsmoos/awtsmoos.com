// B"H
/**
 * @module JobStore
 * Chapter of the living ledger: the Awtsmoos creates each moment anew.
 * A running job is a vessel whose thread cannot be cut by a cache limit;
 * only a completed vessel may leave this small in-process history.
 * Keep the shared Map and existing job objects untouched by replacement.
 */
const crypto = require('crypto');
const jobs = new Map();
const MAX_JOBS = 50;

/** Mint a collision-resistant, filesystem-safe identifier. */
function newJobId() {
	return 'postimport_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
}

/** Preserve active jobs; prune oldest terminal history only when needed. */
function setJob(job) {
	jobs.set(job.id, job);
	if (jobs.size <= MAX_JOBS) return;
	for (const [id, candidate] of jobs) {
		if (jobs.size <= MAX_JOBS) break;
		if (candidate.status === 'queued' || candidate.status === 'running') continue;
		jobs.delete(id);
	}
}

/** Return the canonical mutable job record when it is still resident. */
function getJob(id) {
	return jobs.get(id) || null;
}

/** Identify in-flight jobs without assuming every record has a spec. */
function runningJobsForHeichel(heichelId) {
	const active = [];
	for (const job of jobs.values()) {
		if (job.status !== 'running' && job.status !== 'queued') continue;
		const owner = job.spec?.heichelId || job.heichelId;
		if (!heichelId || owner === heichelId) active.push(job);
	}
	return active;
}

module.exports = {
	newJobId,
	setJob,
	getJob,
	runningJobsForHeichel,
	jobs,
	MAX_JOBS,
};
