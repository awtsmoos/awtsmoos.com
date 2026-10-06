// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentReader
 * @description
 * The Awtsmoos lets native comment light enter only through its dedicated packed
 * indexes. Every page is bounded before bodies or reply branches are expanded.
 */
const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');

function array(value) { return Array.isArray(value) ? value : []; }
function present(value) { return value !== '' && value !== undefined && value !== null; }
function integer(value, fallback, min, max) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}
function same(left, right) { return String(left ?? '') === String(right ?? ''); }
function context(heichelId, postId, extra = {}) { return { heichelId, postId, ...extra }; }

async function expandReplies({ $i, comment, includeDeleted, depth, maxDepth, replyLimit, stats }) {
	const target = paths.childIndexPath(context(comment.heichelId, comment.postId, { commentId: comment.id }));
	const ids = array(access.read($i, target, []));
	if (depth >= maxDepth) {
		stats.truncatedReplies += ids.length;
		return { ...comment, replies: [] };
	}
	const selected = ids.slice(0, replyLimit);
	stats.truncatedReplies += Math.max(0, ids.length - selected.length);
	const replies = [];
	for (const id of selected) {
		const got = access.getComment({ $i, heichelId: comment.heichelId, postId: comment.postId, commentId: id });
		if (!got.success || (!includeDeleted && got.success.deleted)) continue;
		replies.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: depth + 1, maxDepth, replyLimit, stats }));
	}
	return { ...comment, replies };
}


// === Chassidus per-post translation fallback (2026-09-29) ===
const CHASSIDUS_BASE = '/ikar/social/chassidus_translations';
const CHASSIDUS_ALIASES = ['likkutei_translation_en', 'likkuteitorah_translation_en', 'sefer_hasichos_translation_en', 'sichos_kodesh_translation_en', 'meluket_translation_en', 'derechmitzvosecha_translation_en', 'torahohr_translation_en', 'ayinbeis_translation_en'];

function perPostIdsFor({ $i, heichelId, postId, verseSection, subsectionId }) {
	if (heichelId !== 'ikar' || !postId) return [];
	const ids = [];
	for (const alias of CHASSIDUS_ALIASES) {
		let postData = null;
		try {
			postData = access.read($i, CHASSIDUS_BASE + '/' + alias + '/' + postId + '.json', null);
		} catch { continue; }
		if (!postData || !Array.isArray(postData.comments)) continue;
		for (const c of postData.comments) {
			if (!c || !c.id || c.parentId) continue;
			if (present(verseSection) && !same(c.verseSection, verseSection)) continue;
			if (present(subsectionId) && !same(c.subsectionId, subsectionId)) continue;
			ids.push(c.id);
		}
	}
	return ids;
}
// === End Chassidus fallback ===

function indexedIds({ $i, heichelId, postId, verseSection, subsectionId }) {
	let result;
	if (present(subsectionId)) {
		const target = paths.subsectionIndexPath(context(heichelId, postId, { subsectionId }));
		result = { index: 'subsection', ids: array(access.read($i, target, [])) };
	} else if (present(verseSection)) {
		const target = paths.verseIndexPath(context(heichelId, postId, { verseSection }));
		result = { index: 'verse', ids: array(access.read($i, target, [])) };
	} else {
		result = { index: 'roots', ids: array(access.read($i, paths.rootChildrenPath(context(heichelId, postId)), [])) };
	}
	// Union per-post translation IDs with standard IDs (deduped), so posts that
	// have both native comments and imported translations serve both.
	const perPostIds = perPostIdsFor({ $i, heichelId, postId, verseSection, subsectionId });
	if (perPostIds.length > 0) {
		const seen = new Set(result.ids);
		for (const id of perPostIds) {
			if (!seen.has(id)) { seen.add(id); result.ids.push(id); }
		}
		return { index: result.index + '+chassidus', ids: result.ids };
	}
	return result;
}

function matches(comment, verseSection, subsectionId) {
	if (comment.parentId) return false;
	if (present(verseSection) && !same(comment.verseSection, verseSection)) return false;
	if (present(subsectionId) && !same(comment.subsectionId, subsectionId)) return false;
	return true;
}

async function getTree({ $i, heichelId, postId, verseSection = '', subsectionId = '', includeDeleted = false, offset = 0, limit = 50, maxDepth = 5, replyLimit = 50 }) {
	offset = integer(offset, 0, 0, Number.MAX_SAFE_INTEGER);
	limit = integer(limit, 50, 1, 100);
	maxDepth = integer(maxDepth, 5, 0, 8);
	replyLimit = integer(replyLimit, 50, 1, 100);
	const source = indexedIds({ $i, heichelId, postId, verseSection, subsectionId });
	const stats = { scannedIds: 0, truncatedReplies: 0 };
	const out = [];
	let hasMore = false;
	if (source.index === 'roots') {
		const pageIds = source.ids.slice(offset, offset + limit);
		hasMore = offset + pageIds.length < source.ids.length;
		for (const id of pageIds) {
			stats.scannedIds++;
			const got = access.getComment({ $i, heichelId, postId, commentId: id });
			if (!got.success || (!includeDeleted && got.success.deleted)) continue;
			out.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: 0, maxDepth, replyLimit, stats }));
		}
	} else {
		let skipped = 0;
		for (let cursor = 0; cursor < source.ids.length; cursor++) {
			stats.scannedIds++;
			const got = access.getComment({ $i, heichelId, postId, commentId: source.ids[cursor] });
			if (!got.success || (!includeDeleted && got.success.deleted) || !matches(got.success, verseSection, subsectionId)) continue;
			if (skipped++ < offset) continue;
			out.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: 0, maxDepth, replyLimit, stats }));
			if (out.length >= limit) { hasMore = cursor + 1 < source.ids.length; break; }
		}
	}
	return { success: out, meta: { index: source.index, candidateIds: source.ids.length, returnedRootComments: out.length, offset, limit, hasMore, maxDepth, replyLimit, ...stats } };
}

async function getReplies({ $i, heichelId, postId, commentId, includeDeleted = false, offset = 0, limit = 50, maxDepth = 5, replyLimit = 50 }) {
	offset = integer(offset, 0, 0, Number.MAX_SAFE_INTEGER);
	limit = integer(limit, 50, 1, 100);
	const ids = array(access.read($i, paths.childIndexPath(context(heichelId, postId, { commentId })), []));
	const pageIds = ids.slice(offset, offset + limit);
	const stats = { scannedIds: 0, truncatedReplies: 0 };
	const out = [];
	for (const id of pageIds) {
		stats.scannedIds++;
		const got = access.getComment({ $i, heichelId, postId, commentId: id });
		if (!got.success || (!includeDeleted && got.success.deleted)) continue;
		out.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: 1, maxDepth: integer(maxDepth, 5, 1, 8), replyLimit: integer(replyLimit, 50, 1, 100), stats }));
	}
	return { success: out, meta: { index: 'children', candidateIds: ids.length, returnedComments: out.length, offset, limit, hasMore: offset + pageIds.length < ids.length, ...stats } };
}

module.exports = { getReplies, getTree, integer, present };
