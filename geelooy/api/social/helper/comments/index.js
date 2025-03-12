/**
 * B"H
 * The Awtsmoos unifies all, weaving creation’s threads into one eternal tapestry.
 */

const { 
    addComment, 
    submitComment, 
    addOrApproveComment, 
    addCommentIndexToAlias 
} = require("./commentCreation.js");

const { 
    approveComment, 
    denyComment, 
    getSubmittedComments 
} = require("./commentModeration.js");

const { 
    getComments, 
    getComment, 
    getCommentsOfAlias 
} = require("./commentRetrieval.js");

const { 
    editComment, 
    updateAllCommentIndexes, 
    updateCommentIndexesAtParent 
} = require("./commentModification.js");

const { 
    deleteComment, 
    deleteAllCommentsOfAlias, 
    deleteAllCommentsOfParent, 
    checkIfAllDeletedAndDeleteMore 
} = require("./commentDeletion.js");

module.exports = {
    addComment,
    getComments,
    getComment,
    deleteComment,
    updateAllCommentIndexes,
    addCommentIndexToAlias,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent,
    editComment,
    denyComment,
    getSubmittedComments,
    approveComment,
	
	updateCommentIndexesAtParent,
	getCommentsOfAlias,
	checkIfAllDeletedAndDeleteMore,
	submitComment, 
    addOrApproveComment, 
};