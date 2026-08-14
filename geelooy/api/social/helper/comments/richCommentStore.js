// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentStore
 * @description Stable facade for dedicated native comment persistence, with semantic activity projected only after verified creation succeeds.
 */
const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');
const mutation = require('./richCommentMutation.js');
const { recordCommentActivity } = require('./commentActivity.js');
const { deleteOne, deleteSubsectionComments, deleteVerseComments } = require('./richCommentDelete.js');

/** Creates one canonical comment first, then records only its semantic deed without body duplication. */
async function createComment(input) {
	const result = await mutation.createComment(input);
	if (result?.success) {
		await recordCommentActivity({
			$i: input.$i,
			comment: result.success
		});
	}
	return result;
}

async function childrenOf({ $i, heichelId, postId, commentId, includeDeleted = false }) {
	const target = paths.childIndexPath(access.context(heichelId, postId, { commentId }));
	const ids = access.array(access.read($i, target, []));
	const children = [];
	for (const id of ids) {
		const got = access.getComment({ $i, heichelId, postId, commentId: id });
		if (!got.success || (!includeDeleted && got.success.deleted)) continue;
		children.push(await withChildren({ $i, comment: got.success, includeDeleted }));
	}
	return children;
}

async function withChildren({ $i, comment, includeDeleted = false }) {
	return {
		...comment,
		replies: await childrenOf({ $i, heichelId: comment.heichelId, postId: comment.postId, commentId: comment.id, includeDeleted })
	};
}

async function getTree({ $i, heichelId, postId, verseSection = '', subsectionId = '', includeDeleted = false }) {
	const roots = paths.rootChildrenPath(access.context(heichelId, postId));
	const ids = access.array(access.read($i, roots, []));
	const out = [];
	for (const id of ids) {
		const got = access.getComment({ $i, heichelId, postId, commentId: id });
		if (!got.success || (!includeDeleted && got.success.deleted)) continue;
		if (verseSection !== '' && String(got.success.verseSection) !== String(verseSection)) continue;
		if (subsectionId !== '' && String(got.success.subsectionId) !== String(subsectionId)) continue;
		out.push(await withChildren({ $i, comment: got.success, includeDeleted }));
	}
	return { success: out };
}

async function countRecursive({ $i, heichelId, postId, commentId }) {
	const target = paths.childIndexPath(access.context(heichelId, postId, { commentId }));
	let count = 1;
	for (const childId of access.array(access.read($i, target, []))) count += await countRecursive({ $i, heichelId, postId, commentId: childId });
	return count;
}

async function previewDelete({ $i, heichelId, postId, target, field, value }) {
	const ids = access.array(access.read($i, target, []));
	let count = 0;
	for (const commentId of ids) count += await countRecursive({ $i, heichelId, postId, commentId });
	return { success: { [field]: value, rootComments: ids.length, totalComments: count, requiresConfirmation: count > 0 } };
}

function previewVerseDelete({ $i, heichelId, postId, verseSection }) {
	return previewDelete({ $i, heichelId, postId, target: paths.verseIndexPath(access.context(heichelId, postId, { verseSection })), field: 'verseSection', value: verseSection });
}

function previewSubsectionDelete({ $i, heichelId, postId, subsectionId }) {
	return previewDelete({ $i, heichelId, postId, target: paths.subsectionIndexPath(access.context(heichelId, postId, { subsectionId })), field: 'subsectionId', value: subsectionId });
}

module.exports = {
	createComment,
	deleteOne,
	deleteSubsectionComments,
	deleteVerseComments,
	getComment: access.getComment,
	getCommentByUnique: access.getCommentByUnique,
	getTree,
	previewSubsectionDelete,
	previewVerseDelete,
	updateComment: mutation.updateComment
};
