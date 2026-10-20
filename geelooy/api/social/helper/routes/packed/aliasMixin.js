//B"H
//Blessed is He
//Boruch Hashem

/** @module AliasMixin
 * Commentator alias identity for imported posts: derives the alias id
 * and ensures the alias record (with profile) exists before posts are
 * written under it.
 */

const { deriveAliasId } = require('./postValidate.js');

module.exports = {

	// -- alias model + native AwtsmoosDB writes ---------------------------------
	// Yaakov 2026-10-11 (binding): every imported post lands as a FIRST-CLASS
	// native AwtsmoosDB record (via $i.db, the same interface the content
	// routes use), applied to an alias — one alias per commentator, created
	// when missing, carrying full name + aliasId:
	//   /social/aliases/<aliasId>/info    — {aliasId, name, kind, createdAt, createdBy}
	//   /social/aliases/<aliasId>/profile — {aliasId, name, bio}
	// The alias -> org(heichel) relationship (the org profile-like page):
	//   /social/aliases/<aliasId>/heichelosContributedTo/<heichelId> = true
	// The first-class native post record:
	//   /social/heichelos/<heichelId>/posts/<postId> = post
	// The post -> alias link:
	//   /social/aliases/<aliasId>/postsSubmitted/inHeichel/<h>/inSeries/<s>/<postId> = true
	// The native series index (object keyed by postId, per series.js):
	//   /social/heichelos/<heichelId>/series/<seriesId>/posts = { <postId>: {author, postId, title} }
	// The packed JSONL mirror (core/allPosts/meta/search) is still written —
	// it is what the readers serve — but the native records are the system
	// of record for alias/org queries.
	postAliasId(post, heichelId, fallbackAliasId) {
		return deriveAliasId(post && post.commentator, heichelId, fallbackAliasId);
	},


	async ensureAlias($i, aliasCache, aliasId, name, heichelId) {
		if (aliasCache.has(aliasId)) return;
		aliasCache.add(aliasId);
		const infoPath = `/social/aliases/${aliasId}/info`;
		let existing = null;
		try { existing = await $i.db.get(infoPath); } catch (_) { /* ignore */ }
		const now = Date.now();
		if (!existing) {
			await $i.db.write(infoPath, { aliasId, name, kind: 'commentator', createdAt: now, createdBy: 'post-import-api' });
			await $i.db.write(`/social/aliases/${aliasId}/profile`, { aliasId, name, bio: '', createdAt: now });
		} else if (name && (!existing.name || existing.name !== name)) {
			// B"H 2026-10-15: Update alias name if provided and different (Yaakov: no duplicate aliases, update in place)
			await $i.db.write(infoPath, { ...existing, name, updatedAt: now, updatedBy: 'post-import-api' });
			try {
				const profile = await $i.db.get(`/social/aliases/${aliasId}/profile`);
				await $i.db.write(`/social/aliases/${aliasId}/profile`, { ...(profile || {}), aliasId, name, updatedAt: now });
			} catch (_) { /* ignore */ }
		}
		// Alias -> org(heichel) link (queryable both directions).
		// B"H 2026-10-11: object value, not boolean true (see writeNativePost).
		const now2 = Date.now();
		await $i.db.write(`/social/aliases/${aliasId}/heichelosContributedTo/${heichelId}`,
			{ aliasId, heichelId, linkedAt: now2, by: 'post-import-api' });
	}
};
