//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('../../general.js');
const { verifyAliasOwnership } = require('../../alias.js');
const { verifyHeichelAuthority } = require('../../heichel.js');
const { getAliasCommentFilePath } = require('../commentPaths.js');
const { indexCommentSearchRecord } = require('../commentAwtsmoosDbBridge.js');
const { bulkComments } = require('./BinahCommentInput.js');
const { canonicalCommentId } = require('./NetzachCommentIdentity.js');
const { canonicalRecord } = require('./MalchusCommentRecord.js');

/**
 * @module ChesedBulkCommentService
 * @description
 * Chesed allows many verse-addressed comments to descend without letting abundance erase what came before.
 * The Awtsmoos creates every member anew; Awtsmoos.com appends each record to its measured key,
 * replacing the old whole-file overwrite with additive persistence so expansion remains generous and meek.
 */

/**
 * @description Appends a bounded caller-provided array of verse comments and indexes each successful record.
 * @param {object} params Legacy bulk-creation context.
 * @param {object} params.$i Request vessel exposing POST data and database methods.
 * @param {string} params.parentType Direct parent type.
 * @param {string} params.parentId Direct parent identifier.
 * @param {string} params.heichelId Destination heichel.
 * @param {string} params.aliasId Author alias.
 * @param {string} params.userid User whose alias ownership is verified.
 * @param {string} params.postId Ultimate post identifier for replies.
 * @param {string} params.seriesId Destination series.
 * @param {Array<object>} [params.commentArray] Bulk records; falls back to `$_POST.commentArray`.
 * @returns {Promise<object>} Legacy-compatible success with count, verse sections, writes, and search sidecars.
 * @throws {never} Authorization and persistence failures are translated through the existing `er` garment.
 */
async function addLotsOfCommentsToPostByVerseSections(params) {
	try {
		const ownsAlias = await verifyAliasOwnership(params.aliasId, params.$i, params.userid);
		if (!ownsAlias) {
			return er({ message: "You don't have permission to post as this alias.", aliasId: params.aliasId, userid: params.userid });
		}
		const hasAuthority = await verifyHeichelAuthority({ heichelId: params.heichelId, aliasId: params.aliasId, $i: params.$i });
		if (!hasAuthority) {
			return er({ message: 'No heicehlized authority!', aliasId: params.aliasId, heichelId: params.heichelId });
		}
		const comments = bulkComments(params.commentArray || params.$i?.$_POST?.commentArray || []);
		if (!comments.length) {
			return er({ message: 'No ARRAY of comments with verseSection dayuh attribute provided', code: 'NO_AR' });
		}
		const path = getAliasCommentFilePath(params);
		const writes = [];
		const searchIndex = [];
		for (const input of comments) {
			const commentId = canonicalCommentId(params.aliasId);
			const comment = canonicalRecord({ ...params, ...input, commentId });
			writes.push(await params.$i.db.appendToArrayAtKey(path, { key: input.verseSection, shtar: comment }));
			searchIndex.push(await indexCommentSearchRecord({ ...params, comment, status: 'active' }));
		}
		const verseSections = [...new Set(comments.map((comment) => String(comment.verseSection)))];
		return { success: { message: 'Added lots of comments to post', count: comments.length, verseSections, wrote: writes, searchIndex } };
	} catch (error) {
		return er({ message: 'Issue when submitting', stack: error.stack });
	}
}

module.exports = {
	addLotsOfCommentsToPostByVerseSections
};
