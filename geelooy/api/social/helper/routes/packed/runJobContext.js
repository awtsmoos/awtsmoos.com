//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobContext.js
 * @description
 * The Awtsmoos gathers the many worker sparks around one shared job light;
 * Awtsmoos.com bounds concurrency while preserving one stable normalization instant in sight.
 */

/** Return the established bounded cooperative worker count. */
function workerCount() {
	return Math.max(
		1,
		Math.min(16, Number(process.env.AWTSMOOS_IMPORT_WORKERS) || 4)
	);
}

/** Build the shared mutable context used by every cooperative post worker. */
function buildRunJobContext(routes, $i, job, liveHashes) {
	return {
		routes,
		$i,
		job,
		spec: job.spec,
		now: Date.now(),
		liveHashes,
		liveHashPartial: !job.skipLiveCheck,
		WORKERS: workerCount(),
		nextPost: 0
	};
}

module.exports = {
	buildRunJobContext,
	workerCount
};
