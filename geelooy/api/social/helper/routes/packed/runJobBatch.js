//B"H
//Blessed is He
//Boruch Hashem

/** @module RunJobBatch
 * Batched packed-mirror flush: 4 appends per 100 posts instead of 6 sync
 * file ops per post. On batch failure falls back to per-post writes so no
 * post loses its mirror. Ordering guarantee: every post's native write
 * completes before its packed records are queued.
 *
 * B"H 2026-11-10 (speed fix D): the batch holds posts the job just wrote
 * (skips return before the push, so the batch is new posts in practice).
 * skipPriorRead tells the mirror there is no prior record to preserve an
 * fts from — the read is pure waste for a new post. A rare repair
 * re-write (native missing, mirror present) takes a fresh fts.
 */

const { mirrorPostsBulk } = require('../../packed/socialPacked.js');

		function flushPackedBatch(routes, $i, job) {
			if (!job.packedBatch.length) return;
			const batch = job.packedBatch;
			job.packedBatch = [];
			try {
				mirrorPostsBulk({ $i, posts: batch, skipPriorRead: true });
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
