//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('../../general.js');
const { getAliasCommentFilePath } = require('../commentPaths.js');
const { indexCommentSearchRecord } = require('../commentAwtsmoosDbBridge.js');
const { commentInput } = require('./BinahCommentInput.js');
const { canonicalCommentId } = require('./NetzachCommentIdentity.js');
const { canonicalRecord } = require('./MalchusCommentRecord.js');
const { addCommentIndexToAlias } = require('./HodAliasCommentIndex.js');

/**
 * @module TiferesCommentCreationService
 * @description
 * Tiferes joins validated intention, canonical storage, search truth, and lightweight discovery.
 * The Awtsmoos renews every side of the harmony; Awtsmoos.com lets the write finish before optional echoes fly,
 * so one authoritative comment is born once, searchable at once, while secondary indexes never multiply the lie.
 */

/**
 * @description Creates or approves one canonical legacy comment without performing ownership policy checks.
 * @param {object} params Legacy creation context already authorized by a caller or moderation flow.
 * @param {object} params.$i Request vessel exposing POST data and database methods.
 * @param {string} params.parentType Direct parent type.
 * @param {string} params.parentId Direct parent identifier.
 * @param {string} params.heichelId Destination heichel.
 * @param {string} params.aliasId Author alias.
 * @param {string} params.postId Ultimate post identifier for reply comments.
 * @param {string} params.seriesId Destination series.
 * @param {boolean} [params.isApproval=false] Whether the caller describes this as an approval action.
 * @returns {Promise<object>} Legacy-compatible creation success or translated error garment.
 * @throws {never} Database and indexing exceptions are translated at this service boundary.
 */
async function addOrApproveComment(params) {
	try {
		const input = commentInput(params.$i);
		if (!input.content && !input.dayuh) {
			return er('Comment must have content or dayuh.', { code: 'EMPTY_COMMENT' });
		}
		const commentId = canonicalCommentId(params.aliasId);
		const comment = canonicalRecord({ ...params, ...input, commentId });
		const path = getAliasCommentFilePath(params);
		if (!path) {
			return er('Could not determine comment file path.', { code: 'PATH_ERROR' });
		}
		const writeResult = await params.$i.db.appendToArrayAtKey(path, {
			key: input.verseSection,
			shtar: comment
		});
		if (writeResult?.error) {
			return er('Database error: Could not append comment.', {
				code: 'DB_WRITE_ERROR', details: writeResult.error, path, key: input.verseSection
			});
		}
		const searchIndex = await indexCommentSearchRecord({ ...params, comment, status: 'active' });
		const aliasIndex = scheduleAliasIndex(params);
		searchIndex.sideEffects = [aliasIndex];
		return {
			success: true,
			message: params.isApproval ? 'Comment approved and added!' : 'Comment added!',
			details: { id: commentId, path, verseSection: input.verseSection, searchIndex }
		};
	} catch (error) {
		return er('Internal server error during comment processing.', { details: error.stack });
	}
}

/**
 * @description Defers only the non-authoritative alias discovery index after canonical persistence succeeds.
 * @param {object} params Valid creation context passed to the alias index service.
 * @returns {{deferred: boolean, label: string, startedAt: number}} Observable side-effect descriptor.
 * @throws {never} Deferred failures are logged without changing already-successful canonical persistence.
 */
function scheduleAliasIndex(params) {
	const descriptor = { deferred: true, label: 'commentAliasIndex', startedAt: Date.now() };
	setImmediate(async () => {
		try {
			await addCommentIndexToAlias(params);
		} catch (error) {
			console.error('B"H deferred comment alias index failed:', error?.stack || error);
		}
	});
	return descriptor;
}

module.exports = {
	addOrApproveComment,
	scheduleAliasIndex
};
