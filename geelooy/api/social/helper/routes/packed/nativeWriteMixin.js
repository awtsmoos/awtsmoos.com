//B"H
//Blessed is He
//Boruch Hashem

/** @module NativeWriteMixin
 * The actual post writes. Native AwtsmoosDB record FIRST (source of
 * truth), packed mirror second. A crash between them leaves a native
 * record without a mirror, which the idempotency check re-writes -
 * never the reverse (mirror without native used to skip forever).
 */

const { mirrorPost, mirrorPostBulk } = require('../../packed/socialPacked.js');

module.exports = {

	async writeNativePost($i, post) {
		const h = post.heichelId, s = post.seriesId, pid = post.postId, aliasId = post.aliasId;
		const now = Date.now();
		await $i.db.write(`/social/heichelos/${h}/posts/${pid}`, post);
		// B"H 2026-10-11: backlink values must be objects, not boolean true —
		// primitive values do not roundtrip through $i.db.get (ALIAS_LINK_MISSING).
		await $i.db.write(`/social/aliases/${aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`,
			{ postId: pid, aliasId, heichelId: h, seriesId: s, linkedAt: now, by: 'post-import-api' });
	},


	// B"H 2026-10-14 (import-speed): native record ONLY — the hot-loop half
	// of the old writeNativePost. The alias backlink is NOT written here;
	// it is queued via queueBacklink() and flushed in ONE post-job
	// background pass (flushBacklinksBackground), parent-merged: a single
	// read-modify-write per alias/heichel/series instead of one sync write
	// per post. Halves sync DosDB writes in the hot loop.
	async writeNativePostOnly($i, post) {
		// BH 2026-10-19: write to series-specific path to match read path in getPostFromSeries
		// Read: /social/heichelos/<h>/series/<s>/posts/<postId>
		// (was writing to /social/heichelos/<h>/posts/<postId> which reads never see)
		await $i.db.write(`/social/heichelos/${post.heichelId}/series/${post.seriesId}/posts/${post.postId}`, post);
		// Also write to heichel-level for backward compat with any direct lookups
		await $i.db.write(`/social/heichelos/${post.heichelId}/posts/${post.postId}`, post);
	},


	// -- the per-post write ----------------------------------------------------
	// mirrorPostBulk() is the bulk-optimized writer: core shard gets the
	// full document, allPosts gets the compact mirror, plus manifest and
	// search indexes — exactly what the readers expect. The per-post audit
	// event is skipped on the bulk path (the job log is the audit trail).
	writeOnePost($i, post) {
		return mirrorPost({ $i, post });
	},


	writeOnePostBulk($i, post) {
		return mirrorPostBulk({ $i, post });
	}
};
