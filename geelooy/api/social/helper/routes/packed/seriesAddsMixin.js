//B"H
//Blessed is He
//Boruch Hashem

/** @module SeriesAddsMixin
 * Series index accumulation and flush. Entries are collected during the
 * job and flushed ONCE at the end under the per-series mutex - mid-batch
 * flushes lost updates via interleaved read-modify-write.
 */

const { acquireSeriesLock } = require('./importBounds.js');
const { yieldTick } = require('./serverHealth.js');

module.exports = {

	// Series index entries accumulate in memory and flush in bulk (per
	// series): read-modify-write of the series posts object per post would
	// be O(n^2) for large batches.
	seriesAdd(job, post) {
		const key = JSON.stringify([post.heichelId, post.seriesId]);
		if (!job.seriesAdds.has(key)) job.seriesAdds.set(key, new Map());
		job.seriesAdds.get(key).set(post.postId, { author: post.aliasId, postId: post.postId, title: post.title || '' });
	},


	async flushSeriesAdds($i, job) {
		for (const [key, adds] of job.seriesAdds) {
			if (!adds.size) continue;
			// B"H 2026-10-13 (import-speed): per-series mutex. Multiple jobs
			// may flush the same series concurrently; the read-modify-write
			// below must not interleave. Snapshot+clear happens inside the
			// lock so adds made during the flush are never lost.
			const release = await acquireSeriesLock(key);
			try {
				// B"H 2026-10-11: snapshot + clear SYNCHRONOUSLY before any await,
				// so series adds made by concurrent import workers while this
				// flush is in flight are never wiped by the clear().
				const snapshot = new Map(adds);
				adds.clear();
				const [h, s] = JSON.parse(key);
				const p = `/social/heichelos/${h}/series/${s}/posts`;
				let obj = {};
				try { obj = await $i.db.get(p) || {}; } catch (_) { /* ignore */ }
				let changed = false;
				for (const [pid, entry] of snapshot) {
					if (!obj[pid] || obj[pid].author !== entry.author) { obj[pid] = entry; changed = true; }
				}
				if (changed) {
					try { await $i.db.write(p, obj); }
					catch (e) { job.errors.push({ message: 'SERIES_INDEX_FAILED: ' + s + ': ' + (e.message || e) }); }
				}
			} finally {
				release();
			}
		}
		await yieldTick();
	}
};
