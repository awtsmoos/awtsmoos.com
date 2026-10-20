//B"H
//Blessed is He
//Boruch Hashem

/** @module JobStore
 * In-process registry of post-import jobs (id -> job object). Jobs are
 * plain mutable records; this module owns the Map and its invariants
 * (bounded size, one entry per job id).
 * AI SAFEGUARD: never replace the shared Map; other modules hold
 * references to job objects obtained from here.
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Job registry (in-process; survives as long as the server process lives).
// Separate from the comment-import registry: post writes and comment writes
// touch different shards, and each lane keeps its own "one running job"
// invariant so a stuck job in one lane cannot wedge the other.
// Persistent state (below) covers restarts: status/jobs fall back to disk.
// ---------------------------------------------------------------------------
const jobs = new Map();
const MAX_JOBS = 50;


function newJobId() {
	return 'postimport_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
}


function setJob(job) {
	jobs.set(job.id, job);
	if (jobs.size > MAX_JOBS) jobs.delete([...jobs.keys()][0]);
}


function getJob(id) { return jobs.get(id) || null; }


// B"H 2026-10-13 (import-speed): count running jobs per heichel for the
// 4-concurrent limit. Returns the array of running jobs (for JOB_ALREADY_RUNNING
// diagnostics) — empty array means none running.
function runningJobsForHeichel(heichelId) {
	const out = [];
	for (const j of jobs.values()) {
		if (j.status !== 'running' && j.status !== 'queued') continue;
		if (!heichelId || j.spec.heichelId === heichelId) out.push(j);
	}
	return out;
}

module.exports = { newJobId, setJob, getJob, runningJobsForHeichel, jobs, MAX_JOBS };
