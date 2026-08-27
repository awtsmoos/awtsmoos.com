//B"H
//Boruch Hashem
//Blessed is He

const { sp } = require('../../_awtsmoos.constants.js');
const { er } = require('../../general.js');
const { getSubmittedCommentPath } = require('../commentPaths.js');
const { submittedCommentId } = require('./NetzachCommentIdentity.js');
const { submittedRecord } = require('./MalchusCommentRecord.js');

/**
 * @module BinahCommentSubmissionService
 * @description
 * Binah holds a comment in measured potential before moderation releases it into public speech.
 * The Awtsmoos sustains both waiting and arrival; Awtsmoos.com keeps trusted coordinates above raw request foam,
 * so a pending word may wait for judgment without letting an untrusted POST redefine its author or home.
 */

/**
 * @description Persists one pending comment while trusted routing coordinates remain authoritative over request fields.
 * @param {object} params Validated legacy comment-creation context.
 * @param {object} params.$i Request vessel exposing POST input and database methods.
 * @param {string} params.parentType Trusted direct parent type.
 * @param {string} params.parentId Trusted direct parent identifier.
 * @param {string} params.heichelId Trusted destination heichel.
 * @param {string} params.aliasId Trusted author alias.
 * @param {string} params.userid Authenticated user identifier.
 * @param {string} params.postId Trusted ultimate post identifier for replies.
 * @param {string} params.seriesId Trusted destination series identifier.
 * @returns {Promise<object>} Legacy submission result containing comment ID and storage paths.
 * @throws {never} Path and persistence failures are translated through the existing compatibility garment.
 */
async function submitComment(params) {
	const post = params.$i?.$_POST || {};
	const timestamp = Math.floor(Date.now() / 1000);
	const commentId = submittedCommentId(params.aliasId);
	const commentData = submittedRecord({
		content: post.content,
		dayuh: post.dayuh,
		aliasId: params.aliasId,
		parentId: params.parentId,
		parentType: params.parentType,
		postId: params.postId,
		seriesId: params.seriesId,
		userid: params.userid,
		timestamp
	});
	const specificPath = await getSubmittedCommentPath({ ...params, commentId });
	if (typeof specificPath !== 'string' || specificPath?.error) {
		return specificPath;
	}
	const listPath = `${sp}/heichelos/${params.heichelId}/comments/submitted/list/${params.parentType}/${params.parentId}`;
	const detailPath = `${sp}/heichelos/${params.heichelId}/comments/submitted/all/${commentId}`;
	commentData.awtsmoosDayuh = submissionCoordinates(params, specificPath);
	try {
		await params.$i.db.write(specificPath, commentData);
		await params.$i.db.write(detailPath, commentData);
		await params.$i.db.arrayAppend(listPath, {
			commentId,
			aliasId: params.aliasId,
			timestamp,
			path: specificPath
		});
		return {
			success: true,
			message: 'Comment submitted for approval.',
			commentId,
			path: specificPath,
			allPath: detailPath
		};
	} catch (error) {
		return er('Failed to write submitted comment.', {
			details: error.stack,
			path: specificPath
		});
	}
}

/**
 * @description Builds immutable moderation coordinates from the validated context rather than the raw request body.
 * @param {object} params Trusted comment routing context.
 * @param {string} specificPath Author-specific pending-comment path.
 * @returns {object} Legacy `awtsmoosDayuh` moderation coordinates.
 * @throws {never} Pure record assembly performs no IO.
 */
function submissionCoordinates(params, specificPath) {
	return {
		BH: 'Boruch Hashem - Submitted',
		submittedCommentSpecificPath: specificPath,
		parentId: params.parentId,
		parentType: params.parentType,
		postId: params.postId,
		commentAliasId: params.aliasId,
		heichelId: params.heichelId
	};
}

module.exports = {
	submitComment,
	submissionCoordinates
};
