//B"H
//Blessed is He
//Boruch Hashem

/** @module StatusMixin
 * Job status / list routes. Status falls back to the persisted on-disk
 * job state when the in-memory registry has no entry (restarts).
 *
 * B"H 2026-10-21 (Worker A, status-speed):
 *  - status() accepts job=<id>, jobId=<id> and id=<id>. jobId is the
 *    name start() returns and clients document; previously only `job`
 *    was read, so ?jobId= polls got JOB_NOT_FOUND with an empty echoed
 *    id even for live jobs.
 *  - list() previously iterated a bare `jobs` variable that was never
 *    imported (only setJob was) — every call threw ReferenceError and
 *    surfaced as HTTP 500 ROUTE_ERROR. It now imports the registry Map
 *    from jobStore.js.
 *  - list() no longer parses every persisted job file synchronously
 *    (~25k files); it merges the in-memory registry with the async,
 *    bounded, cached disk snapshot from jobState.js.
 *  - status() uses the async disk fallback and caps donePostIds in the
 *    response (full count + truncation flag preserved for resume logic).
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { getJobViewAsync, jobStateShape, listJobStatesAsync } = require('./jobState.js');
const { jobs } = require('./jobStore.js');
const ownership = require('./ownership.js');

// B"H 2026-10-26 (account-auth import): status/list used operator-grade
// checkAuth(), so a logged-in user who started a job could not poll it
// — that is why the Mac operator key was needed to finish anything.
// These routes now use the detailed form (any authenticated Awtsmoos
// user, admin or not) and scope non-admin callers to jobs whose aliasId
// is one of their own aliases. A job with no aliasId, or an alias
// outside the caller's set, reads as JOB_NOT_FOUND: existence is never
// leaked to a caller who may not see it.
async function accountScope(route) {
	if (typeof route.checkAuthDetailed !== 'function') {
		const auth = route.checkAuth();
		return auth ? { authError: auth, caller: null, scope: null } : { authError: null, caller: null, scope: null, legacyAdmin: true };
	}
	const detailed = route.checkAuthDetailed();
	if (detailed.authError) return { authError: detailed.authError, caller: null, scope: null };
	const caller = detailed.caller;
	if (!caller || caller.isAdmin) return { authError: null, caller, scope: null };
	const scope = await ownership.callerAliasSet(route.$i, caller);
	return { authError: null, caller, scope };
}

function jobAliasOf(found) {
	return found?.job?.spec?.aliasId || found?.view?.aliasId || found?.job?.aliasId || null;
}

const DONE_IDS_CAP = 1000;

module.exports = {

	/** GET /packed/import/posts/status?job=<id> | ?jobId=<id> [&wait=1&waitMs=1000]
	 *
	 * B"H 2026-10-13 (import-speed): long-poll support. Pass wait=1 to hold
	 * the request until the job reaches a terminal state or waitMs elapses
	 * (default 1000ms, max 5000ms). Without wait=1, returns immediately.
	 */
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const account = await accountScope(this);
		if (account.authError) return account.authError;
		// AGENT IDENTITY 2026-10-19
		try{const _h=(this.$i&&this.$i.headers)||{};console.log("[AGENT-OP] id="+(_h["x-agent-identity"]||"UNIDENTIFIED")+" kind="+(_h["x-agent-kind"]||"UNKNOWN"));}catch(_){}
		const jobId = requestValue(this.$i, 'job') || requestValue(this.$i, 'jobId') || requestValue(this.$i, 'id');
		const waitRaw = requestValue(this.$i, 'wait');
		const wait = waitRaw === '1' || waitRaw === 'true';
		const waitMs = wait
			? Math.min(Math.max(parseInt(requestValue(this.$i, 'waitMs'), 10) || 1000, 100), 5000)
			: 0;
		const TERMINAL = new Set(['done', 'failed', 'cancelled', 'absolute-failure', 'interrupted', 'paused']);
		if (wait && waitMs > 0) {
			const start = Date.now();
			while (Date.now() - start < waitMs) {
				const found = await getJobViewAsync(this.$i, jobId);
				if (!found) break; // JOB_NOT_FOUND — return immediately
				if (TERMINAL.has(found.view.status)) break;
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
		const found = await getJobViewAsync(this.$i, jobId);
		if (!found) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		if (account.scope) {
			const alias = jobAliasOf(found);
			if (!alias || !account.scope.has(String(alias))) return { success: false, error: 'JOB_NOT_FOUND', jobId };
		}
		const v = found.view;
		const allDoneIds = v.donePostIds || [];
		return {
			success: {
				id: v.id, status: v.status, dryRun: v.dryRun, live: found.live,
				heichelId: v.heichelId, source: v.source, totalPosts: v.totalPosts,
				postsDone: v.postsDone, wrote: v.wrote, updated: v.updated,
				skipped: v.skipped, failed: v.failed,
				backlinksPending: v.backlinksPending || 0, backlinksDone: v.backlinksDone || 0,
				preHashed: v.preHashed || 0, preHashVerified: v.preHashVerified || 0,
				preHashMismatches: v.preHashMismatches || 0, preHashUntrusted: !!v.preHashUntrusted,
				errors: (v.errors || []).slice(-10),
				donePostIds: allDoneIds.slice(0, DONE_IDS_CAP),
				donePostIdsCount: allDoneIds.length,
				donePostIdsTruncated: allDoneIds.length > DONE_IDS_CAP,
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
		const account = await accountScope(this);
		if (account.authError) return account.authError;
		// AGENT IDENTITY 2026-10-19
		try{const _h=(this.$i&&this.$i.headers)||{};console.log("[AGENT-OP] id="+(_h["x-agent-identity"]||"UNIDENTIFIED")+" kind="+(_h["x-agent-kind"]||"UNKNOWN"));}catch(_){}
		const byId = new Map();
		for (const j of jobs.values()) byId.set(j.id, { ...jobStateShape(j), live: true });
		for (const d of await listJobStatesAsync(this.$i, 50)) {
			if (d && d.id && !byId.has(d.id)) byId.set(d.id, { ...d, live: false });
		}
		const visible = account.scope
			? [...byId.values()].filter(j => {
				const alias = j.aliasId || j.spec?.aliasId;
				return alias && account.scope.has(String(alias));
			})
			: [...byId.values()];
		return {
			success: visible
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
