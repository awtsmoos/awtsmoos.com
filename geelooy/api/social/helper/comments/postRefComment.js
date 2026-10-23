// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostRefComment
 * @description Post-as-comment linking BY REFERENCE (worker G, 2026-10-21).
 * A postRef comment lives in the canonical rich-comment store on the TARGET
 * post. It carries only the reference {refHeichelId, refSeriesId, refPostId},
 * the commentator labels (aliasId + commentatorName) and a short excerpt
 * projection. The full text stays in the source post — never copied.
 * Labels are denormalized at link time from the source post and re-resolved
 * from the source post at read time (enrichPostRef), so a later source edit
 * updates the label everywhere the link surfaces; the denormalized label is
 * the fallback when the source can no longer be read.
 */
const crypto = require('crypto');
const { er } = require('../general.js');
const access = require('./richCommentAccess.js');
const paths = require('./richCommentPaths.js');
const { indexAliasComment } = require('./aliasCommentIndex.js');
const { uniqueCommentUrl } = require('./richCommentSchema.js');
const { recordCommentActivity } = require('./commentActivity.js');
const { verifyAliasOwnership } = require('../alias.js');

/**
 * INTERIM authorization (worker G, 2026-10-21) — drop-in point for worker I's
 * shared helper (authenticate -> {identity, isAdmin, via}; authorizeWrite).
 * Multi-user model: any authenticated user acts as themselves; linking a post
 * onto a target is a write on the TARGET, so it requires owning the target
 * post (via its author alias) or being the platform operator. The operator
 * check mirrors the platform's existing definition in
 * helper/routes/packed/authCoreMixin.js (OAuth bearer identity of the
 * operator account) until the shared helper supersedes it.
 */
function isPlatformOperator($i, userid) {
	if (!userid) return false;
	try {
		const { readBearer } = require('../../../oauth/core/tokenReader.js');
		const resolved = readBearer($i);
		if (!resolved?.ok) return false;
		const entry = resolved.entry || {};
		return String(entry.userId || '') === String(userid)
			&& String(entry.userId || '') === 'asdf';
	} catch {
		return false;
	}
}

async function ownsAlias($i, userid, aliasId) {
	if (!userid || !aliasId) return false;
	try { return Boolean(await verifyAliasOwnership(aliasId, $i, userid)); } catch { return false; }
}

/** Rule: post-as-comment linking = write on target -> target owner or admin. */
async function authorizeTargetWrite({ $i, userid, heichelId, postId }) {
	if (!userid) return null;
	if (isPlatformOperator($i, userid)) return { via: 'admin' };
	const post = await readSourcePost($i, { heichelId, postId });
	const ownerAlias = post?.aliasId || post?.author || '';
	if (ownerAlias && await ownsAlias($i, userid, ownerAlias)) return { via: 'target-owner', aliasId: ownerAlias };
	return null;
}

/** Rule: comment delete = comment's own author or admin only. */
async function authorizeCommentDelete({ $i, userid, heichelId, postId, commentId }) {
	if (!userid) return null;
	if (isPlatformOperator($i, userid)) return { via: 'admin' };
	const got = access.getComment({ $i, heichelId, postId, commentId });
	if (!got?.success) return null;
	const authorAlias = got.success.aliasId || got.success.author || '';
	if (authorAlias && await ownsAlias($i, userid, authorAlias)) return { via: 'comment-author', aliasId: authorAlias };
	return null;
}

/** Deterministic id in the bulk-lane shape, so retries/resume are idempotent. */
function postRefCommentId({ heichelId, postId, ref, verseSection, aliasId }) {
	const h = crypto.createHash('sha256');
	h.update([heichelId, postId, ref.heichelId, ref.seriesId, ref.postId, String(verseSection || '')].join('\n'));
	const hex = h.digest('hex');
	const tsPart = String(BigInt('0x' + hex.slice(0, 12)) % 9000000000000n + 1000000000000n);
	return 'BH_' + tsPart + '_' + hex.slice(12, 28) + '_commentBy_' + aliasId;
}

/**
 * Best-effort read of a post's native record (the system-of-record copy the
 * packed import writes at /social/heichelos/<h>/posts/<postId>). Returns null
 * when the native record is unavailable; callers fall back to supplied labels.
 */
async function readSourcePost($i, ref) {
	try {
		if (!$i?.db?.get) return null;
		// Per-request memo: link batches carry many links to one source post,
		// whose native record is large; read it once per request.
		const cache = $i.__postRefSourceCache || ($i.__postRefSourceCache = new Map());
		const key = `${ref.heichelId}/${ref.postId}`;
		if (cache.has(key)) return cache.get(key);
		const post = await $i.db.get(`/social/heichelos/${ref.heichelId}/posts/${ref.postId}`);
		const value = post && typeof post === 'object' ? post : null;
		cache.set(key, value);
		return value;
	} catch {
		return null;
	}
}

function labelsFromPost(post) {
	if (!post) return {};
	return {
		aliasId: post.aliasId || post.author || '',
		commentatorName: post.commentator || post.commentatorName || post.authorName || ''
	};
}

function excerptOf(post, supplied) {
	if (supplied) return String(supplied).slice(0, 400);
	const unit = Array.isArray(post?.units) ? post.units.find(u => u && (u.he || u.en)) : null;
	return String(unit?.he || unit?.en || post?.title || '').replace(/<[^>]+>/g, '').slice(0, 400);
}

/**
 * Creates (or returns the existing) postRef comment on a target post.
 * input: { $i, heichelId, postId, seriesId, ref:{heichelId,seriesId,postId},
 *          aliasId?, commentatorName?, title?, excerpt?, verseSection?, masechta? }
 * Labels resolve from the source post when readable and override supplied ones.
 */
async function createPostRefComment(input) {
	const { $i, heichelId, postId } = input;
	const ref = input.ref || {};
	if (!heichelId || !postId) return er({ code: 'MISSING_PARAMS', message: 'heichelId and postId (target) are required.' });
	if (!ref.heichelId || !ref.postId) return er({ code: 'MISSING_PARAMS', message: 'postRef requires ref.heichelId and ref.postId.' });
	ref.seriesId = ref.seriesId || 'root';
	const verseSection = input.verseSection === undefined || input.verseSection === null ? '' : String(input.verseSection);
	// Index repair: a comment body can outlive its index entries (the packed
	// store's index arrays are read-modify-write and can lose entries under
	// concurrent multi-process store activity). Every replay therefore
	// re-ensures the alias pointer + roots + verse indexes idempotently.
	const ensureIndexes = async comment => {
		await indexAliasComment({ $i, comment });
		const ctx = access.context(heichelId, postId, {
			commentId: comment.id,
			verseSection: comment.verseSection,
			subsectionId: comment.subsectionId
		});
		access.writeIndex($i, paths.rootChildrenPath(ctx), comment.id);
		access.writeIndex($i, paths.verseIndexPath(ctx), comment.id);
	};
	// Fast idempotent replay: when the caller supplies the aliasId, the
	// deterministic id is computable before any source read.
	if (input.aliasId) {
		const earlyId = postRefCommentId({ heichelId, postId, ref, verseSection, aliasId: input.aliasId });
		const early = access.getComment({ $i, heichelId, postId, commentId: earlyId });
		if (early?.success) {
			await ensureIndexes(early.success);
			return { success: early.success, existed: true };
		}
	}
	const source = await readSourcePost($i, ref);
	const fromSource = labelsFromPost(source);
	const aliasId = fromSource.aliasId || input.aliasId || '';
	const commentatorName = fromSource.commentatorName || input.commentatorName || '';
	if (!aliasId) return er({ code: 'MISSING_LABELS', message: 'Cannot resolve commentator aliasId for the referenced post; supply aliasId.' });
	const id = postRefCommentId({ heichelId, postId, ref, verseSection, aliasId });
	const existing = access.getComment({ $i, heichelId, postId, commentId: id });
	if (existing?.success) {
		await ensureIndexes(existing.success);
		return { success: existing.success, existed: true };
	}
	const now = Date.now();
	const comment = {
		id,
		heichelId,
		postId,
		entityId: postId,
		seriesId: input.seriesId || 'root',
		parentId: '',
		parentSectionId: '',
		parentType: 'entity',
		aliasId,
		author: aliasId,
		commentatorName,
		kind: 'postRef',
		postRef: { heichelId: ref.heichelId, seriesId: ref.seriesId, postId: ref.postId },
		title: String((source && source.title) || input.title || ''),
		excerpt: excerptOf(source, input.excerpt),
		content: excerptOf(source, input.excerpt),
		verseSection,
		subsectionId: '',
		dayuh: { kind: 'postRef', masechta: input.masechta || '', vilnaDaf: verseSection },
		url: '',
		createdAt: now,
		updatedAt: now,
		deleted: false
	};
	comment.url = uniqueCommentUrl(comment);
	const context = access.context(heichelId, postId, {
		commentId: comment.id,
		verseSection: comment.verseSection,
		subsectionId: comment.subsectionId
	});
	access.write($i, paths.commentPath(context), comment);
	access.write($i, paths.uniquePath({ commentId: comment.id }), { heichelId, postId, seriesId: comment.seriesId });
	await indexAliasComment({ $i, comment });
	access.writeIndex($i, paths.rootChildrenPath(context), comment.id);
	access.writeIndex($i, paths.verseIndexPath(context), comment.id);
	try { await recordCommentActivity({ $i, comment }); } catch { /* activity is a projection; never fail the link */ }
	return { success: comment, existed: false };
}

/**
 * Read-time label refresh: for postRef rows, re-resolve aliasId /
 * commentatorName / title from the source post when it is readable, so
 * labels stay correct even if the source post is edited after linking.
 * Mutates and returns the rows array (roots + one reply level is enough —
 * postRefs are roots by construction).
 */
async function enrichPostRefs($i, rows) {
	if (!Array.isArray(rows)) return rows;
	for (const row of rows) {
		if (row?.kind === 'postRef' && row.postRef?.postId) {
			const source = await readSourcePost($i, row.postRef);
			if (source) {
				const labels = labelsFromPost(source);
				if (labels.aliasId) { row.aliasId = labels.aliasId; row.author = labels.aliasId; }
				if (labels.commentatorName) row.commentatorName = labels.commentatorName;
				if (source.title) row.title = String(source.title);
			}
		}
		if (Array.isArray(row?.replies)) await enrichPostRefs($i, row.replies);
	}
	return rows;
}

module.exports = {
	authorizeCommentDelete,
	authorizeTargetWrite,
	isPlatformOperator,
	createPostRefComment,
	enrichPostRefs,
	postRefCommentId,
	readSourcePost
};
