//B"H
//Blessed is He
//Boruch Hashem

/** @module BacklinksMixin
 * Deferred alias backlinks. The hot import loop only queues backlinks;
 * one background pass after the job flushes them parent-merged (one
 * read-modify-write per alias/heichel/series, not per post).
 *
 * B"H 2026-10-20 (flap-fix): some alias series parents are REAL
 * directories left by the old on-disk layout (e.g. .../inSeries/
 * torasChaim-בראשית1), so $i.db.get(parent) throws EISDIR and the
 * merged object write could never land there. The old code silently
 * DROPPED every backlink for such a parent. Now the EISDIR branch
 * lands each leaf as its own record under the directory instead —
 * readers list directory children, so the backlinks become visible.
 */

const { acquireSeriesLock } = require('./importBounds.js');
const { appendJobLog } = require('./jobLog.js');
const { setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { yieldTick } = require('./serverHealth.js');
const { yieldEvery } = require('../../safeguards/yieldEvery.js');

module.exports = {

	// Queue one alias backlink for the post-job background flush. Deduped by
	// (aliasId, heichelId, seriesId, postId); the queued value is tiny.
	queueBacklink(job, post) {
		if (!post.aliasId || !post.postId) return;
		if (!job.backlinkQueue) job.backlinkQueue = new Map();
		const key = post.aliasId + '|' + post.heichelId + '|' + post.seriesId + '|' + post.postId;
		if (!job.backlinkQueue.has(key)) {
			job.backlinkQueue.set(key, {
				aliasId: post.aliasId, h: post.heichelId, s: post.seriesId, pid: post.postId,
			});
		}
	},


	// Post-job background backlink flush. Runs AFTER the job is terminal and
	// the 6s watchdog is cleared — it can never trip the limit. Groups queued
	// backlinks by parent path and does ONE read-modify-write per parent
	// (the PathWriteBatch coalescing pattern), mutex-guarded per parent so
	// concurrent jobs cannot interleave. Never awaited by runJob callers.
	async flushBacklinksBackground($i, job) {
		const queue = job.backlinkQueue;
		job.backlinkQueue = new Map();
		const total = queue ? queue.size : 0;
		job.backlinksPending = total;
		job.backlinksDone = 0;
		setJob(job);
		if (!total) { job.backlinksPending = 0; setJob(job); return; }
		appendJobLog($i, { jobId: job.id, event: 'backlinks-flush-start', pending: total });
		try {
			const groups = new Map(); // parentPath -> Map(pid -> value)
			const now = Date.now();
			// B"H 2026-10-20 (safeguards phase 3): grouping a huge queue
			// is a long loop — it breathes on a time budget (yieldEvery).
			const groupTick = yieldEvery(8);
			for (const b of queue.values()) {
				await groupTick();
				const parent = `/social/aliases/${b.aliasId}/postsSubmitted/inHeichel/${b.h}/inSeries/${b.s}`;
				if (!groups.has(parent)) groups.set(parent, new Map());
				groups.get(parent).set(b.pid, {
					postId: b.pid, aliasId: b.aliasId, heichelId: b.h, seriesId: b.s,
					linkedAt: now, by: 'post-import-api',
				});
			}
			for (const [parent, leaves] of groups) {
				const release = await acquireSeriesLock('backlink:' + parent);
				try {
					let obj = {};
					let parentIsDir = false;
					try { obj = await $i.db.get(parent) || {}; } catch (e) {
						if (e && (e.code === "EISDIR" || (e.message && e.message.includes("EISDIR")))) {
							parentIsDir = true;
						}
						/* any other read error: treat the parent as empty */
					}
					if (parentIsDir) {
						for (const [pid, val] of leaves) {
							try { await $i.db.write(parent + '/' + pid, val); }
							catch (_) { job.backlinkErrors = (job.backlinkErrors || 0) + 1; }
						}
					} else {
						let changed = false;
						for (const [pid, val] of leaves) {
							// B"H 2026-10-11: object values, not boolean true.
							if (!obj[pid]) { obj[pid] = val; changed = true; }
						}
						if (changed) await $i.db.write(parent, obj);
					}
				} catch (e) {
					job.backlinkErrors = (job.backlinkErrors || 0) + 1;
					job.errors.push({ message: 'BACKLINK_FLUSH_FAILED: ' + parent + ': ' + (e.message || e) });
				} finally {
					release();
				}
				job.backlinksDone += leaves.size;
				job.backlinksPending = total - job.backlinksDone;
				setJob(job);
				await yieldTick();
			}
		} catch (e) {
			job.errors.push({ message: 'BACKLINK_FLUSH_FATAL: ' + (e.message || e) });
			setJob(job);
		}
		job.backlinksPending = 0;
		setJob(job);
		saveJobState($i, job);
		appendJobLog($i, {
			jobId: job.id, event: 'backlinks-flushed',
			done: job.backlinksDone, errors: job.backlinkErrors || 0,
		});
	}
};
