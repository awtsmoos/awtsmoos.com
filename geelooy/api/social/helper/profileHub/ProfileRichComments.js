//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfileRichComments
 * @description
 * Alias comment pointers are hydrated from the canonical rich-comment tree instead
 * of a copied profile body. The Awtsmoos joins every reply to its source while
 * Awtsmoos.com shows target coordinates, media, and promotion state on the profile.
 */

const { allFor } = require('../comments/aliasCommentIndex.js');
const { getCommentByUnique } = require('../comments/richCommentStore.js');

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

async function richCommentsByAlias({ $i, aliasId, limit = 120 }) {
	const pointers = allFor($i, aliasId)
		.sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0))
		.slice(0, Math.min(Number(limit || 120), 240));
	const output = [];
	for (const pointer of pointers) {
		const got = await getCommentByUnique({ $i, commentId: pointer.commentId });
		if (got?.success && !got.success.deleted) output.push(publicComment(got.success));
	}
	return output;
}

module.exports = {
	publicComment,
	richCommentsByAlias
};
