//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobFactory.js
 * @description
 * The Awtsmoos brings each import vessel into being with every counter named;
 * Awtsmoos.com records caller policy at birth so later watchdogs need not guess who came.
 */

const { newJobId } = require('./jobStore.js');

/** Build one complete in-memory post-import job from validated admission inputs. */
function buildJob(options) {
	const {
		dryRun,
		heichelId,
		isAdmin,
		jobAliasId,
		jobAliasName,
		posts,
		skipLiveCheck,
		source,
		stagedDir,
		timeBudgetMs,
		// Bulk-upload redesign §3.5/§3.6: job kind (import | update),
		// resume lineage, staged manifest reference, and series.json.
		kind,
		resumeOf,
		attempt,
		originalTotalPosts,
		uploadId,
		series,
		caller
	} = options;
	const now = Date.now();
	return {
		id: newJobId(),
		status: 'queued',
		kind: kind || 'import',
		resumeOf: resumeOf || null,
		attempt: attempt || 0,
		originalTotalPosts: originalTotalPosts || null,
		dryRun,
		isAdmin: !!isAdmin,
		caller: caller ? { identity: caller.identity, userId: caller.userId, accountId: caller.accountId, isAdmin: !!caller.isAdmin, via: caller.via } : null,
		spec: {
			heichelId,
			posts,
			source,
			stagedDir,
			uploadId: uploadId || null,
			series: series || null,
			aliasId: jobAliasId,
			aliasName: jobAliasName
		},
		timeBudgetMs,
		skipLiveCheck,
		totalPosts: posts.length,
		postsDone: 0,
		wrote: 0,
		updated: 0,
		skipped: 0,
		failed: 0,
		errors: [],
		doneHashes: {},
		aliasCache: new Set(),
		seriesAdds: new Map(),
		packedBatch: [],
		backlinkQueue: new Map(),
		backlinksPending: 0,
		backlinksDone: 0,
		backlinkErrors: 0,
		preHashed: 0,
		preHashVerified: 0,
		preHashMismatches: 0,
		preHashUntrusted: false,
		cancelRequested: false,
		createdAt: now,
		updatedAt: now,
		startedAt: null,
		finishedAt: null,
		durationMs: null
	};
}

module.exports = { buildJob };
