//B"H
//Boruch Hashem
//Blessed be He

const paths = require("./richCommentPaths.js");
const access = require("./richCommentAccess.js");
const { deleteOne } = require("./richCommentDelete.js");

/**
 * @file Whole-post cascade for native community discussion.
 * @description When a post itself is deleted (directly, through its series,
 * or through its heichel), every rich comment rooted on that post must be
 * neutralized with it. This module is the single seam for that cascade: it
 * enumerates the post's root comments through the rich comment access layer
 * and tombstones each root through the same deleteOne primitive the comment
 * routes use, so descendants, alias indexes, and verse/subsection indexes
 * are handled identically everywhere. Canonical source material is never
 * touched: deleteOne refuses it, and any protected roots are reported back
 * and left in the root index, exactly like the indexed bulk deletes.
 */
async function deleteAllRichCommentsForPost({ $i, heichelId, postId, reason = "post-deleted" }) {
	const context = access.context(heichelId, postId, {});
	const rootsPath = paths.rootChildrenPath(context);
	const rootIds = access.array(access.read($i, rootsPath, []));
	let deleted = 0;
	const protectedIds = [];
	const missing = [];
	for (const commentId of rootIds) {
		const result = await deleteOne({ $i, heichelId, postId, commentId, reason });
		deleted += result.deleted || 0;
		protectedIds.push(...(result.protected || []));
		missing.push(...(result.missing || []));
	}
	// Mirror the indexed bulk deletes: the root index afterwards names only
	// the comments that were protected from deletion.
	access.write($i, rootsPath, [...new Set(protectedIds)]);
	return {
		deleted,
		protected: [...new Set(protectedIds)],
		missing,
		roots: rootIds.length
	};
}

module.exports = { deleteAllRichCommentsForPost };
