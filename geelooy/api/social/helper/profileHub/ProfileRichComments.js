//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfileRichComments
 * @description
 * Alias comment pointers are hydrated from the canonical rich-comment tree instead
 * of a copied profile body. The Awtsmoos joins every reply to its source while
 * Awtsmoos.com shows target coordinates, media, and promotion state on the profile.
 *
 * B"H 2026-10-21 (Worker N — latency): hydration was a serial await per comment
 * (up to `limit` sequential store reads per profile view). Pointers are now
 * hydrated in bounded parallel batches (12 wide), preserving pointer order and
 * the deleted-filter exactly. A pointer-count export lets callers report the
 * alias's exact indexed comment total without hydrating a single body; the
 * count is only as complete as the alias comment index itself (Worker G's
 * backfill owns that completeness).
 */

const { allFor } = require('../comments/aliasCommentIndex.js');
const { getCommentByUnique } = require('../comments/richCommentStore.js');

const HYDRATE_WIDTH = 12;

function publicComment(comment) {
	return {
		id: comment.id,
		aliasId: comment.aliasId,
		heichelId: comment.heichelId,
		seriesId: comment.seriesId,
		postId: comment.postId,
		parentId: comment.parentId,
		parentSectionId: comment.parentSectionId,
		verseSection: comment.verseSection,
		subsectionId: comment.subsectionId,
		content: comment.content,
		audioNoteText: comment.audioNoteText,
		mood: comment.mood,
		assets: comment.assets || [],
		links: comment.links || [],
		sections: comment.sections || [],
		createdAt: comment.createdAt,
		updatedAt: comment.updatedAt,
		deleted: Boolean(comment.deleted)
	};
}

function commentPointerCount({ $i, aliasId }) {
	try {
		return (allFor($i, aliasId) || []).length;
	} catch {
		return null;
	}
}

async function richCommentsByAlias({ $i, aliasId, limit = 120 }) {
	const pointers = allFor($i, aliasId)
		.sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0))
		// B"H 2026-10-21 (alias profiles): no hidden 240 ceiling — the profile
		// must be able to show ALL of an alias's comments; the caller's limit
		// is the only bound (sanity-guarded at 5000).
		.slice(0, Math.min(Number(limit || 120), 5000));
	const output = [];
	for (let start = 0; start < pointers.length; start += HYDRATE_WIDTH) {
		const batch = pointers.slice(start, start + HYDRATE_WIDTH);
		const hydrated = await Promise.all(batch.map(async pointer => {
			const got = await getCommentByUnique({ $i, commentId: pointer.commentId });
			return got?.success && !got.success.deleted ? publicComment(got.success) : null;
		}));
		for (const comment of hydrated) if (comment) output.push(comment);
	}
	return output;
}

module.exports = {
	publicComment,
	richCommentsByAlias,
	commentPointerCount
};
