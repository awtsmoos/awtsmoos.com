//B"H
//Blessed is He
//Boruch Hashem

/** @module StatusMixin
 * Job status / list routes. Status falls back to the persisted on-disk
 * job state when the in-memory registry has no entry (restarts).
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { getJobView, jobStateShape, listJobStates, saveJobState } = require('./jobState.js');
const { setJob } = require('./jobStore.js');

module.exports = {

	/** GET /packed/import/posts/status?job=<id>[&wait=1&waitMs=1000]
	 *
	 * B"H 2026-10-13 (import-speed): long-poll support. Pass wait=1 to hold
	 * the request until the job reaches a terminal state or waitMs elapses
	 * (default 1000ms, max 5000ms). This eliminates the client's fixed 5s
	 * poll interval — the server notifies immediately on completion.
	 * Without wait=1, behaves as before (immediate return).
	 */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// AGENT IDENTITY 2026-10-19
		try{const _h=(this.$i&&this.$i.headers)||{};console.log("[AGENT-OP] id="+(_h["x-agent-identity"]||"UNIDENTIFIED")+" kind="+(_h["x-agent-kind"]||"UNKNOWN"));}catch(_){}
		const jobId = requestValue(this.$i, 'job');
		// B"H 2026-10-13 (import-speed): long-poll parameters.
		const waitRaw = requestValue(this.$i, 'wait');
		const wait = waitRaw === '1' || waitRaw === 'true';
		const waitMs = wait
			? Math.min(Math.max(parseInt(requestValue(this.$i, 'waitMs'), 10) || 1000, 100), 5000)
			: 0;
		const TERMINAL = new Set(['done', 'failed', 'cancelled', 'absolute-failure', 'interrupted', 'paused']);
		if (wait && waitMs > 0) {
			const start = Date.now();
			while (Date.now() - start < waitMs) {
				const found = getJobView(this.$i, jobId);
				if (!found) break; // JOB_NOT_FOUND — return immediately
				if (TERMINAL.has(found.view.status)) break;
				// Wait 100ms before re-checking. Non-blocking.
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
		const found = getJobView(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		const v = found.view;
		return {
			success: {
				id: v.id, status: v.status, dryRun: v.dryRun, live: found.live,
				heichelId: v.heichelId, source: v.source, totalPosts: v.totalPosts,
				postsDone: v.postsDone, wrote: v.wrote, updated: v.updated,
				skipped: v.skipped, failed: v.failed,
				// B"H 2026-10-14 (import-speed): deferred-backlink + pre-hash visibility.
				backlinksPending: v.backlinksPending || 0, backlinksDone: v.backlinksDone || 0,
				preHashed: v.preHashed || 0, preHashVerified: v.preHashVerified || 0,
				preHashMismatches: v.preHashMismatches || 0, preHashUntrusted: !!v.preHashUntrusted,
				errors: (v.errors || []).slice(-10),
				donePostIds: v.donePostIds || [],
				createdAt: v.createdAt, updatedAt: v.updatedAt,
				startedAt: v.startedAt, finishedAt: v.finishedAt,
				durationMs: v.durationMs,
			}
		};
	},


	/** GET /packed/import/posts/jobs */
	async list() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// AGENT IDENTITY 2026-10-19
		try{const _h=(this.$i&&this.$i.headers)||{};console.log("[AGENT-OP] id="+(_h["x-agent-identity"]||"UNIDENTIFIED")+" kind="+(_h["x-agent-kind"]||"UNKNOWN"));}catch(_){}
		const byId = new Map();
		for (const j of jobs.values()) byId.set(j.id, { ...jobStateShape(j), live: true });
		for (const d of listJobStates(this.$i)) {
			if (!byId.has(d.id)) byId.set(d.id, { ...d, live: false });
		}
		return {
			success: [...byId.values()]
				.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
				.slice(0, 50)
				.map(j => ({
					id: j.id, status: j.status, dryRun: j.dryRun, live: j.live,
					heichelId: j.heichelId, source: j.source,
					totalPosts: j.totalPosts, postsDone: j.postsDone,
					wrote: j.wrote, updated: j.updated, skipped: j.skipped, failed: j.failed,
					errors: (j.errors || []).length, durationMs: j.durationMs,
				}))
		};
	}
};
