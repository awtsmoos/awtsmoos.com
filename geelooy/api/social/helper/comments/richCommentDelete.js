//B"H
//Boruch Hashem
//Blessed be He

const { indexAliasComment } = require("./aliasCommentIndex.js");
const { isCanonicalSource, immutableSourceError } = require("./richCommentPolicy.js");
const paths = require("./richCommentPaths.js");
const access = require("./richCommentAccess.js");

/**
 * @file Bounded deletion for native community discussion.
 * @description The Awtsmoos lets social words be removed while recovered Torah remains fixed in its canonical vessel.
 * Awtsmoos.com preserves canonical source IDs inside verse and subsection indexes even during bulk community cleanup.
 */
async function deleteOne({ $i, heichelId, postId, commentId, reason = "deleted" }) {
	const got = access.getComment({ $i, heichelId, postId, commentId });
	if (!got.success) {
		return { deleted: 0, protected: [], missing: [commentId] };
	}
	const comment = got.success;
	if (isCanonicalSource(comment)) {
		return {
			deleted: 0,
			protected: [commentId],
			missing: [],
			error: immutableSourceError(comment)
		};
	}
	let deleted = comment.deleted ? 0 : 1;
	const protectedIds = [];
	const children = access.array(
		access.read(
			$i,
			paths.childIndexPath(access.context(heichelId, postId, { commentId })),
			[]
		)
	);
	for (const childId of children) {
		const child = await deleteOne({ $i, heichelId, postId, commentId: childId, reason });
		deleted += child.deleted;
		protectedIds.push(...(child.protected || []));
	}
	const tombstone = {
		...comment,
		deleted: true,
		deletedAt: Date.now(),
		deleteReason: reason,
		content: "",
		audioNoteText: "",
		assets: [],
		sections: [],
		links: [],
		previews: []
	};
	access.write(
		$i,
		paths.commentPath(access.context(heichelId, postId, { commentId })),
		tombstone
	);
	await indexAliasComment({ $i, comment: tombstone });
	access.removeIndex(
		$i,
		paths.verseIndexPath(access.context(heichelId, postId, { verseSection: comment.verseSection })),
		commentId
	);
	if (comment.subsectionId) {
		access.removeIndex(
			$i,
			paths.subsectionIndexPath(access.context(heichelId, postId, { subsectionId: comment.subsectionId })),
			commentId
		);
	}
	return { deleted, protected: protectedIds, missing: [] };
}

async function deleteIndexedComments({ $i, heichelId, postId, target, reason }) {
	const ids = access.array(access.read($i, target, []));
	let deleted = 0;
	const protectedIds = [];
	const missing = [];
	for (const commentId of ids) {
		const result = await deleteOne({ $i, heichelId, postId, commentId, reason });
		deleted += result.deleted;
		protectedIds.push(...(result.protected || []));
		missing.push(...(result.missing || []));
	}
	access.write($i, target, [...new Set(protectedIds)]);
	return { deleted, protected: [...new Set(protectedIds)], missing };
}

async function deleteVerseComments({ $i, heichelId, postId, verseSection }) {
	const target = paths.verseIndexPath(access.context(heichelId, postId, { verseSection }));
	const result = await deleteIndexedComments({
		$i,
		heichelId,
		postId,
		target,
		reason: `verse:${verseSection}`
	});
	return { success: { verseSection, ...result } };
}

async function deleteSubsectionComments({ $i, heichelId, postId, subsectionId }) {
	const target = paths.subsectionIndexPath(access.context(heichelId, postId, { subsectionId }));
	const result = await deleteIndexedComments({
		$i,
		heichelId,
		postId,
		target,
		reason: `subsection:${subsectionId}`
	});
	return { success: { subsectionId, ...result } };
}

module.exports = { deleteOne, deleteSubsectionComments, deleteVerseComments };
