//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletion
 * @description Barrel for comment deletion: re-exports the identical surface from the split sibling modules.
 */

	const { deleteComment } = require("./commentDeletionSingle.js");

	const { loadCommentForDeletion } = require("./commentDeletionSingleLoad.js");

	const { storeCommentDeletion } = require("./commentDeletionSingleStore.js");

	const { deleteAliasFileAndCleanup } = require("./commentDeletionAliasCore.js");

	const { deleteParentCommentsCore } = require("./commentDeletionParentCore.js");

	const { deleteAllCommentsOfAlias } = require("./commentDeletionAlias.js");

	const { deleteAllCommentsOfParent } = require("./commentDeletionParent.js");

module.exports = {
    deleteComment,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent
};
