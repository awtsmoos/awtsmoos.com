//B"H
//Blessed is He
//Boruch Hashem

/** @module RunJobBatch
 * Batched packed-mirror flush: 4 appends per 100 posts instead of 6 sync
 * file ops per post. On batch failure falls back to per-post writes so no
 * post loses its mirror. Ordering guarantee: every post's native write
 * completes before its packed records are queued.
 */

const { mirrorPostsBulk } = require('../../packed/socialPacked.js');

		function flushPackedBatch(routes, $i, job) {
			if (!job.packedBatch.length) return;
			const batch = job.packedBatch;
			job.packedBatch = [];
			try {
				mirrorPostsBulk({ $i, posts: batch });
			} catch (e) {
				job.errors.push({ message: 'PACKED_BATCH_FAILED: ' + (e.message || e) + ' (' + batch.length + ' posts)' });
				// Fall back to per-post writes so no post loses its mirror.
				for (const p of batch) {
					try { routes.writeOnePostBulk($i, p); }
					catch (e2) { job.errors.push({ postId: p.postId, message: 'PACKED_FALLBACK_FAILED: ' + (e2.message || e2) }); }
				}
			}
}

module.exports = { flushPackedBatch };
