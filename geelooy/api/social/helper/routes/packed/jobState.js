//B"H
//Blessed is He
//Boruch Hashem

/** @module JobState
 * Persistent on-disk job state: <dbRoot>/socialPacked/post-import-jobs/
 * <jobId>.json. Written at checkpoints and terminal states so status/jobs
 * survive production restarts; a job found 'running' on disk is honestly
 * reported as 'interrupted'.
 */

const fs = require('fs');
const path = require('path');
const { scheduleJobStateCleanup } = require('./postImportJobStateRetention.js');
const { getJob } = require('./jobStore.js');


// ---------------------------------------------------------------------------
// Import lock — REMOVED (Yaakov 2026-10-13, absolute law: import jobs must
// NEVER block anything else, ever). Deploys touch the repo tree, imports
// touch the DB dir — disjoint. Restart safety comes from idempotent writes
// + persistent job state + client resume, not from a global lock.
// (The old import-in-progress.lock file is left unread; any stale lock
//  from before this change is simply ignored.)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Persistent job state — <dbRoot>/socialPacked/post-import-jobs/<jobId>.json
// Written at checkpoints and terminal states; read by status/jobs when the
// in-memory registry has no record (e.g. after a production restart).
// ---------------------------------------------------------------------------
function jobStateDir($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'post-import-jobs');
}


function jobStateShape(job) {
	// B"H 2026-10-13: packedBatch excluded — it's up to 100 full post objects
	// queued for the batched packed-mirror flush; persisting it would bloat
	// the state file and it's purely in-memory work-queue state. A restart
	// loses the queued batch, but the posts' native writes are already done
	// and idempotent, so resume re-queues them via the doneHashes check.
	const { spec, doneHashes, aliasCache, seriesAdds, packedBatch, backlinkQueue, ...rest } = job || {};
	// B"H 2026-10-11: spec may be absent on in-memory verify jobs (the disk
	// copy gets spec via saveJobState's spread). Never throw here — a shape
	// helper throwing turns every status poll into a 500 ROUTE_ERROR.
	// B"H 2026-10-14 (import-speed): backlinkQueue serialized (not the Map)
	// for crash recovery — replay via POST /packed/import/posts/flush-backlinks.
	return {
		...rest,
		heichelId: spec?.heichelId || job?.heichelId,
		source: spec?.source,
		donePostIds: Object.keys(doneHashes || {}),
		backlinkQueue: backlinkQueue && backlinkQueue.size ? [...backlinkQueue.values()] : undefined,
	};
}


function saveJobState($i, job) {
	try {
		const dir = jobStateDir($i);
		fs.mkdirSync(dir, { recursive: true });
		// Preserve durable checkpoints without synchronously scanning history.
		fs.writeFileSync(path.join(dir, job.id + '.json'), JSON.stringify(jobStateShape(job)));
		scheduleJobStateCleanup(dir);
	} catch (_) { /* best effort */ }
}


function loadJobState($i, id) {
	try {
		const raw = JSON.parse(fs.readFileSync(path.join(jobStateDir($i), id + '.json'), 'utf8'));
		// A job that was mid-flight when the server restarted can never
		// complete: report it honestly so the client resumes with a new job.
		if (raw.status === 'running' || raw.status === 'queued') raw.status = 'interrupted';
		return raw;
	} catch (_) { return null; }
}


function listJobStates($i) {
	const out = [];
	try {
		const dir = jobStateDir($i);
		if (!fs.existsSync(dir)) return out;
		for (const f of fs.readdirSync(dir)) {
			if (!f.endsWith('.json')) continue;
			try {
				const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
				if (raw.status === 'running' || raw.status === 'queued') raw.status = 'interrupted';
				out.push(raw);
			} catch (_) { /* ignore */ }
		}
	} catch (_) { /* ignore */ }
	return out;
}


/** Unified job view: in-memory first, persistent disk state as fallback. */
function getJobView($i, id) {
	const mem = getJob(id);
	if (mem) return { view: jobStateShape(mem), live: true, job: mem };
	const disk = loadJobState($i, id);
	if (disk) return { view: disk, live: false, job: null };
	return null;
}

module.exports = { jobStateDir, jobStateShape, saveJobState, loadJobState, listJobStates, getJobView };
