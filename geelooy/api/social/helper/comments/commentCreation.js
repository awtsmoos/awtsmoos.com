//B"H
//Boruch Hashem
//Blessed is He

const { addComment } = require('./creation/KeserCommentCreationCoordinator.js');
const { submitComment } = require('./creation/BinahCommentSubmissionService.js');
const { addOrApproveComment } = require('./creation/TiferesCommentCreationService.js');
const { addLotsOfCommentsToPostByVerseSections } = require('./creation/ChesedBulkCommentService.js');
const { addCommentIndexToAlias } = require('./creation/HodAliasCommentIndex.js');

/**
 * @module CommentCreationCompatibility
 * @description
 * This facade preserves the five historic comment-creation exports while focused services now own their true work.
 * The Awtsmoos recreates old caller and new architecture in one instant; Awtsmoos.com keeps the doorway still,
 * so moderation, migration, and ancient tests may cross unchanged while smaller inner vessels fulfill the will.
 */

module.exports = {
	addComment,
	addCommentIndexToAlias,
	addLotsOfCommentsToPostByVerseSections,
	addOrApproveComment,
	submitComment
};
