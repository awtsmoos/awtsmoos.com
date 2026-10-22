//B"H
//Blessed is He
//Boruch Hashem

/** @module RemoveMixin
 * Deletes one imported post end to end: native record, commentator alias
 * recompute, packed mirror, then cache invalidation. Deleting inside the
 * stream is allowed; deletion state lives in the packed shard itself.
 */

const { requireMethod, requestValue } = require('./requestValues.js');
const { logicalKey } = require('../../packed/shardPaths.js');

module.exports = {

	/** POST /packed/import/posts/remove {heichelId, postId} — signed.
	 * Deletes a wrongly-placed post: native record, alias backlink, series
	 * index entry, plus a packed-shard tombstone (append-only shard). */
	async remove() {
		// MULTI-FACTOR DELETE AUTH 2026-10-19 by site owner order:
		// Factor 1: POST method. Factor 2: normal auth. Factor 3: owner confirm header.
		// Factor 4: agent identity (must identify as human or ai with source).
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		const hdrs = (this.$i && this.$i.headers) || {};
		const confirm = hdrs['x-owner-delete-confirm'] || '';
		if (confirm !== 'OWNER_CONFIRMED_DELETE_20261019') {
			return { success: false, error: 'DELETE_NEEDS_OWNER_CONFIRM', message: 'Owner confirmation required.' };
		}
		const agentId = hdrs['x-agent-identity'] || '';
		const agentKind = hdrs['x-agent-kind'] || '';
		const agentSrc = hdrs['x-agent-source'] || '';
		if (!agentId || !agentKind || !agentSrc) {
			return { success: false, error: 'DELETE_NEEDS_IDENTITY', message: 'Agent must identify: X-Agent-Identity, X-Agent-Kind (human/ai), X-Agent-Source required.' };
		}
		console.log('[DELETE-AUTHORIZED] agent=' + agentId + ' kind=' + agentKind + ' source=' + agentSrc);
		const body = this.$i?.body || {};
		const heichelId = String(body.heichelId || requestValue(this.$i, 'heichelId') || '');
		const postId = String(body.postId || requestValue(this.$i, 'postId') || '');
		if (!heichelId || !postId) {
			return { success: false, error: 'BAD_ARGS', message: 'heichelId and postId are required' };
		}
		const removed = [];
		let post = null;
		try { post = await this.$i.db.get(`/social/heichelos/${heichelId}/posts/${postId}`); } catch (_) { /* ignore */ }
		if (post) {
			const s = post.seriesId || 'root';
			try {
				await this.$i.db.delete(`/social/heichelos/${heichelId}/posts/${postId}`);
				removed.push('native');
			} catch (e) { return { success: false, error: 'DELETE_FAILED', message: 'native: ' + (e.message || e) }; }
			if (post.aliasId) {
				try {
					await this.$i.db.delete(`/social/aliases/${post.aliasId}/postsSubmitted/inHeichel/${heichelId}/inSeries/${s}/${postId}`);
					removed.push('backlink');
				} catch (_) { /* backlink may not exist */ }
			}
			try {
				const sp = `/social/heichelos/${heichelId}/series/${s}/posts`;
				const obj = await this.$i.db.get(sp) || {};
				if (obj[postId]) {
					delete obj[postId];
					await this.$i.db.write(sp, obj);
					removed.push('series');
				}
			} catch (_) { /* series index may not exist */ }
		}
		// Optional stray-alias cleanup: {aliasId} removes the alias info record
		// and any backlinks the bad import wrote under it for this post.
		const strayAlias = String(body.strayAliasId || requestValue(this.$i, 'strayAliasId') || '');
		if (strayAlias && /^[A-Za-z0-9_-]{1,80}$/.test(strayAlias)) {
			const s2 = (post && post.seriesId) || 'root';
			try { await this.$i.db.delete(`/social/aliases/${strayAlias}/postsSubmitted/inHeichel/${heichelId}/inSeries/${s2}/${postId}`); removed.push('stray-backlink'); } catch (_) {}
			try { await this.$i.db.delete(`/social/aliases/${strayAlias}/info`); removed.push('stray-alias-info'); } catch (_) {}
		}
		try {
			const { writePacked } = require('../../packed/socialPacked.js');
			writePacked({ $i: this.$i, shard: 'core', key: logicalKey(['posts', heichelId, postId]), value: null, op: 'del', meta: { kind: 'postTombstone' } });
			removed.push('packed-tombstone');
		} catch (_) { /* non-fatal */ }
		// B"H 2026-10-22 (header-fix crew): the import also mirrors every post
		// into the allPosts shard, and the grouped index / census fold THAT
		// shard - a core-only tombstone left removed posts listed as census
		// ghosts forever. Tombstone the mirror with its own key so a delete
		// is end-to-end, as this route's contract states.
		try {
			const { writePacked } = require('../../packed/socialPacked.js');
			writePacked({ $i: this.$i, shard: 'allPosts', key: logicalKey(['allPosts', heichelId, postId]), value: null, op: 'del', meta: { kind: 'postTombstone' } });
			removed.push('allposts-tombstone');
		} catch (_) { /* non-fatal */ }
		return { success: { heichelId, postId, removed, existed: !!post } };
	}
};
