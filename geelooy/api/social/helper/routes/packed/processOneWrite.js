//B"H
//Blessed is He
//Boruch Hashem

/** @module ProcessOneWrite
 * Second half of per-post processing: idempotency checks (this-job
 * doneHashes, live packed-shard hash + native-record verification),
 * the native AwtsmoosDB write, alias ensure, backlink queueing, batched
 * packed mirror, series index add, and job counters.
 * Native FIRST, packed mirror second - a crash between them leaves a
 * native record the skip check re-writes, never a mirror without native.
 */

const { setJob } = require('./jobStore.js');
const { yieldTick, checkServerHealth } = require('./serverHealth.js');
const { flushPackedBatch } = require('./runJobBatch.js');

async function processOneWrite(ctx, vd) {
	const { routes, $i, job, spec, liveHashes } = ctx;
	const post = vd.post, hash = vd.hash, aliasName = vd.aliasName;
			const liveHash = liveHashes.get(post.postId);
			if (job.doneHashes[post.postId] === hash) {
				// Already processed by THIS job: skip unconditionally.
				job.skipped++;
				return;
			}
			if (liveHash === hash) {
				// B"H 2026-10-11: airtight idempotency. The packed mirror can
				// exist without the native record (server crash between the
				// two writes); a packed-hash match alone must not skip the
				// native write. Verify the native record exists before
				// skipping, otherwise fall through and re-write.
				let nativeOk = false;
				try {
					const existingNative = await $i.db.get(`/social/heichelos/${post.heichelId}/posts/${post.postId}`);
					nativeOk = !!existingNative;
				} catch (_) { /* treat as missing -> re-write */ }
				if (nativeOk) {
					job.skipped++;
					job.doneHashes[post.postId] = hash;
					// B"H 2026-10-12: series index must populate even for
					// idempotent skips — otherwise re-imports leave series
					// pages empty (posts live but unlisted).
					routes.seriesAdd(job, post);
					return;
				}
			}
			const existed = job.doneHashes[post.postId] !== undefined || liveHashes.has(post.postId);
			if (!job.dryRun) {
				try {
					// B"H 2026-10-11: native FIRST (source of truth), packed
					// mirror second. A crash between them now leaves a native
					// record without a packed mirror — which the skip check
					// above re-writes idempotently — instead of the reverse
					// (packed without native), which used to skip forever.
					// B"H 2026-10-14 (import-speed): native record ONLY in the hot
					// loop; the alias backlink is queued for the post-job
					// background flush (halves sync writes per post).
					await routes.writeNativePostOnly($i, post); // first-class native AwtsmoosDB record
					await routes.ensureAlias($i, job.aliasCache, post.aliasId, aliasName, spec.heichelId);
					routes.queueBacklink(job, post);
					// B"H 2026-10-13 (import-speed): packed mirror is BATCHED,
					// not written per-post. The old per-post path did 6 sync
					// file ops (mkdir+stat+append+index) per post; the batch
					// does 4 appends per 100 posts. Ordering guarantee kept:
					// every post's native write completes before its packed
					// records are queued, so packed => native always holds.
					// A crash before the flush leaves native-without-packed,
					// which resume re-writes idempotently (see skip check).
					job.packedBatch.push(post);
					if (job.packedBatch.length >= 100) {
						flushPackedBatch(routes, $i, job);
					}
					routes.seriesAdd(job, post);
				} catch (e) {
					job.failed++;
					job.errors.push({ postId: post.postId, message: 'WRITE_FAILED: ' + (e.message || e) });
					return;
				}
			}
			job.doneHashes[post.postId] = hash;
			liveHashes.set(post.postId, hash);
			job.postsDone++;
			if (existed) job.updated++;
			else job.wrote++;
			// B"H 2026-10-13 (import-speed): yield every 50 posts, not every
			// post. Per-post yields were 1000+ event-loop round-trips for a
			// 1000-post job; every-50 keeps the server responsive at 1/50th
			// the cost. The packed batch flush above is sync but bounded
			// (~100 posts), so no single block exceeds ~100ms.
			job.updatedAt = Date.now();
			setJob(job);
			if (job.postsDone % 50 === 0) { await yieldTick(); await checkServerHealth(); }
}

module.exports = { processOneWrite };
