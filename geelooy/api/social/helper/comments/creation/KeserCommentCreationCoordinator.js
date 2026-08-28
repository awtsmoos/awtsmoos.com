//B"H
//Boruch Hashem
//Blessed is He

const { NO_LOGIN } = require('../../_awtsmoos.constants.js');
const { er } = require('../../general.js');
const { creationAuthority, resolveUserId } = require('./GevurahCommentAuthority.js');
const { addOrApproveComment } = require('./TiferesCommentCreationService.js');
const { submitComment } = require('./BinahCommentSubmissionService.js');
const { addLotsOfCommentsToPostByVerseSections } = require('./ChesedBulkCommentService.js');

/**
 * @module KeserCommentCreationCoordinator
 * @description
 * Keser reads the whole creation intention and chooses the proper descent without owning lower-layer details.
 * The Awtsmoos is beyond every crown and every call; Awtsmoos.com lets this coordinator read like a psalm,
 * where identity, authority, approval, and abundance each enter their own vessel and the public contract remains calm.
 */

/**
 * @description Validates one legacy creation request, resolves authority policy, and delegates to the correct service.
 * @param {object} params Legacy creation context.
 * @param {object} params.$i Awtsmoos request vessel containing session, POST data, and database access.
 * @param {string} [params.parentType='post'] Direct parent type.
 * @param {string} params.parentId Direct parent identifier.
 * @param {string} params.heichelId Destination heichel.
 * @param {string} params.aliasId Author alias.
 * @param {string} [params.userid] Optional explicit authenticated user identifier.
 * @param {string} [params.postId] Ultimate post identifier, required when parent is a comment.
 * @param {string} params.seriesId Destination series.
 * @returns {Promise<object>} Legacy-compatible direct, submitted, bulk, or error result.
 * @throws {never} Unexpected authorization/service errors are translated at this outer boundary.
 */
async function addComment(params) {
	try {
		const context = { parentType: 'post', ...params };
		const missing = requiredFields(context);
		if (missing.length) {
			return er('Missing required parameters for addComment', { ...context, $i: undefined, missing });
		}
		if (context.parentType === 'comment' && !context.postId) {
			return er("postId is required when parentType is 'comment'");
		}
		context.userid = resolveUserId(context.$i, context.userid);
		if (!context.userid) {
			return er(NO_LOGIN);
		}
		const authority = await creationAuthority(context);
		if (!authority.ownsAlias) {
			return er("You don't have permission to post as this alias.", { aliasId: context.aliasId, userid: context.userid });
		}
		if (authority.mode === 'closed') {
			return er({ message: 'Comment submissions are closed for this heichel.', code: 'COMMENT_SUBMISSIONS_CLOSED' });
		}
		if (authority.mode === 'submit') {
			return submitComment(context);
		}
		if (Array.isArray(context.$i?.$_POST?.commentArray)) {
			return addLotsOfCommentsToPostByVerseSections({ ...context, commentArray: context.$i.$_POST.commentArray });
		}
		return addOrApproveComment(context);
	} catch (error) {
		return er('Internal server error during comment addition.', { details: error.stack });
	}
}

/**
 * @description Lists missing mandatory creation coordinates without mutating the caller.
 * @param {object} params Candidate creation context.
 * @returns {Array<string>} Names of absent mandatory fields.
 * @throws {never} Pure validation never performs IO.
 */
function requiredFields(params) {
	return ['parentType', 'parentId', 'heichelId', 'aliasId', 'seriesId'].filter((field) => !params[field]);
}

module.exports = {
	addComment,
	requiredFields
};
