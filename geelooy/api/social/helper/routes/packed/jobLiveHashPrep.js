//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobLiveHashPrep.js
 * @description
 * The Awtsmoos reveals indexed hints without making an optimization into a prison;
 * Awtsmoos.com abandons a stuck cache prepass softly, then asks native truth per post with precision.
 */

const LIVE_HASH_PREP_LIMIT_MS = Math.max(
	30000,
	Number(process.env.AWTSMOOS_LIVE_HASH_PREP_MS) || 480000
);

/** Resolve a promise before a soft deadline or reject only the optional optimization. */
function withSoftDeadline(promise, milliseconds) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('LIVE_HASH_PREP_SOFT_TIMEOUT'));
		}, milliseconds);
		Promise.resolve(promise).then(
			value => {
				clearTimeout(timer);
				resolve(value);
			},
			error => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

/**
 * Build the partial live-hash cache through the asynchronous indexed path only.
 * An empty partial cache is safe because the write phase probes native truth on misses.
 */
async function prepareLiveHashes(routes, $i, job) {
	const startedAt = Date.now();
	const spec = job.spec;
	let liveHashes = new Map();
	if (!job.skipLiveCheck) {
		try {
			if (typeof routes.buildLiveHashCacheForPostsAsync !== 'function') {
				throw new Error('ASYNC_LIVE_HASH_BUILDER_REQUIRED');
			}
			const postIds = (spec.posts || [])
				.map(post => post && post.postId)
				.filter(Boolean);
			liveHashes = await withSoftDeadline(
				routes.buildLiveHashCacheForPostsAsync($i, spec.heichelId, postIds),
				LIVE_HASH_PREP_LIMIT_MS
			);
		} catch (error) {
			job.errors.push({
				message: 'LIVE_CACHE_FAILED: ' + (error?.message || error)
			});
		}
	}
	job.cacheBuildMs = Date.now() - startedAt;
	return liveHashes;
}

module.exports = {
	LIVE_HASH_PREP_LIMIT_MS,
	prepareLiveHashes,
	withSoftDeadline
};
