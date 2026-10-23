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
		timeBudgetMs
	} = options;
	const now = Date.now();
	return {
		id: newJobId(),
		status: 'queued',
		dryRun,
		isAdmin: !!isAdmin,
		spec: {
			heichelId,
			posts,
			source,
			stagedDir,
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
