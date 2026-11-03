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
	} catch (error) {
		// A failed count used to vanish silently; the caller still gets
		// null (unknown), but the failure is now visible in server logs.
		console.error(`ProfileRichComments: pointer count failed for alias "${aliasId}":`, error);
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
	let dropped = 0;
	for (let start = 0; start < pointers.length; start += HYDRATE_WIDTH) {
		const batch = pointers.slice(start, start + HYDRATE_WIDTH);
		const hydrated = await Promise.all(batch.map(async pointer => {
			let got = null;
			try {
				got = await getCommentByUnique({ $i, commentId: pointer.commentId });
			} catch (error) {
				// One unreadable comment must not sink the whole list,
				// but it must not disappear quietly either: the pointer
				// exists in the alias index while its body could not be
				// read, and that gap is exactly what operators need.
				console.error(`ProfileRichComments: hydration failed for alias "${aliasId}", comment "${pointer.commentId}":`, error);
				dropped++;
				return null;
			}
			if (!got?.success) {
				console.warn(`ProfileRichComments: pointer without a readable comment for alias "${aliasId}", comment "${pointer.commentId}" (store answered ${got?.error?.code || 'no success payload'}).`);
				dropped++;
				return null;
			}
			// Deleted comments are filtered by design; that is the one
			// drop that is not an error and stays quiet.
			return got.success.deleted ? null : publicComment(got.success);
		}));
		for (const comment of hydrated) if (comment) output.push(comment);
	}
	if (dropped) {
		console.warn(`ProfileRichComments: alias "${aliasId}" has ${pointers.length} indexed pointers; ${dropped} could not be hydrated and were omitted from the rendered list. The pointer count remains the honest total.`);
	}
	return output;
}

module.exports = {
	publicComment,
	richCommentsByAlias,
	commentPointerCount
};
