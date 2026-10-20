//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModeration
 * @description Barrel for comment moderation: re-exports the identical surface from the split sibling modules.
 */

	const { approveComment } = require("./commentModerationApprove.js");

	const { moveApprovedComment } = require("./commentModerationApproveMove.js");

	const { deleteDeniedComment } = require("./commentModerationDenyDelete.js");

	const { denyComment } = require("./commentModerationDeny.js");

	const { getSubmittedComments } = require("./commentModerationSubmitted.js");

module.exports = { 
    approveComment, 
    denyComment, 
    getSubmittedComments 
};
