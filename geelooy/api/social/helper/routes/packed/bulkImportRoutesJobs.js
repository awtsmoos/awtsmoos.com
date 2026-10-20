//B"H
//Blessed is He
//Boruch Hashem

/**
 * Bulk import in-process job registry (split from bulkImportRoutes.js).
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Job registry (in-process; survives as long as the server process lives).
// ---------------------------------------------------------------------------
const jobs = new Map();
const MAX_JOBS = 50;

function newJobId() {
	return 'bulk_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
}

function setJob(job) {
	jobs.set(job.id, job);
	if (jobs.size > MAX_JOBS) jobs.delete([...jobs.keys()][0]);
}

function getJob(id) { return jobs.get(id) || null; }

function runningJob(heichelId) {
	// B"H Yaakov 2026-10-13: heichel-scoped — different heichels import concurrently,
	// same heichel never has two running jobs (prevents write races within one corpus).
	for (const j of jobs.values()) {
		if (j.status !== 'running') continue;
		if (!heichelId || j.spec.heichelId === heichelId) return j;
	}
	return null;
}

function yieldTick() { return new Promise(resolve => setImmediate(resolve)); }

module.exports = {
	jobs,
	MAX_JOBS,
	newJobId,
	setJob,
	getJob,
	runningJob,
	yieldTick,
};
