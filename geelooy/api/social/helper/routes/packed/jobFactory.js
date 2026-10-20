//B"H
//Blessed is He
//Boruch Hashem

/** @module JobFactory
 * Builds a fresh post-import job record. Every counter, queue, and cache
 * a job owns is initialized here and only here - if a field exists on a
 * job, it must be born in buildJob.
 * AI SAFEGUARD: job state is persisted verbatim (Map/Set fields are
 * shaped by jobStateShape). Add fields carefully.
 */

const { newJobId } = require('./jobStore.js');

function buildJob(o) {
	const { dryRun, heichelId, posts, source, stagedDir, jobAliasId,
		jobAliasName, timeBudgetMs, skipLiveCheck } = o;
	const job = {
			id: newJobId(), status: 'queued', dryRun,
			spec: { heichelId, posts, source, stagedDir, aliasId: jobAliasId, aliasName: jobAliasName },
			timeBudgetMs, skipLiveCheck,
			totalPosts: posts.length,
			postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
			errors: [], doneHashes: {},
			aliasCache: new Set(), seriesAdds: new Map(),
			packedBatch: [],
			// B"H 2026-10-14 (import-speed): deferred backlink queue (post-
			// job background flush) + pre-hash verification counters.
			backlinkQueue: new Map(),
			backlinksPending: 0, backlinksDone: 0, backlinkErrors: 0,
			preHashed: 0, preHashVerified: 0, preHashMismatches: 0, preHashUntrusted: false,
			cancelRequested: false,
			createdAt: Date.now(), updatedAt: Date.now(),
			startedAt: null, finishedAt: null, durationMs: null,
	};
	return job;
}

module.exports = { buildJob };
