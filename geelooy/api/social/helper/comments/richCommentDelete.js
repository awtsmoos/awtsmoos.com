// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentDelete
 * @description
 * Deletion turns rich comments into bounded tombstones inside the dedicated store
 * and repairs verse/subsection indexes without consulting historical comments.
 */
const { indexAliasComment } = require('./aliasCommentIndex.js');
const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');

async function deleteOne({ $i, heichelId, postId, commentId, reason = 'deleted' }) {
	const got = access.getComment({ $i, heichelId, postId, commentId });
	if (!got.success) return { deleted: 0, missing: [commentId] };
	const comment = got.success;
	let count = comment.deleted ? 0 : 1;
	const children = access.array(access.read($i, paths.childIndexPath(access.context(heichelId, postId, { commentId })), []));
	for (const childId of children) {
		count += (await deleteOne({ $i, heichelId, postId, commentId: childId, reason })).deleted;
	}
	const tombstone = {
		...comment, deleted: true, deletedAt: Date.now(), deleteReason: reason,
		content: '', audioNoteText: '', assets: [], sections: [], links: [], previews: []
	};
	access.write($i, paths.commentPath(access.context(heichelId, postId, { commentId })), tombstone);
	await indexAliasComment({ $i, comment: tombstone });
	access.removeIndex($i, paths.verseIndexPath(access.context(heichelId, postId, { verseSection: comment.verseSection })), commentId);
	if (comment.subsectionId) {
		access.removeIndex($i, paths.subsectionIndexPath(access.context(heichelId, postId, { subsectionId: comment.subsectionId })), commentId);
	}
	return { deleted: count, missing: [] };
}

async function deleteVerseComments({ $i, heichelId, postId, verseSection }) {
	const target = paths.verseIndexPath(access.context(heichelId, postId, { verseSection }));
	const list = access.array(access.read($i, target, []));
	let deleted = 0;
	for (const commentId of [...list]) {
		deleted += (await deleteOne({ $i, heichelId, postId, commentId, reason: `verse:${verseSection}` })).deleted;
	}
	access.write($i, target, []);
	return { success: { verseSection, deleted } };
}

async function deleteSubsectionComments({ $i, heichelId, postId, subsectionId }) {
	const target = paths.subsectionIndexPath(access.context(heichelId, postId, { subsectionId }));
	const list = access.array(access.read($i, target, []));
	let deleted = 0;
	for (const commentId of [...list]) {
		deleted += (await deleteOne({ $i, heichelId, postId, commentId, reason: `subsection:${subsectionId}` })).deleted;
	}
	access.write($i, target, []);
	return { success: { subsectionId, deleted } };
}

module.exports = { deleteOne, deleteSubsectionComments, deleteVerseComments };
