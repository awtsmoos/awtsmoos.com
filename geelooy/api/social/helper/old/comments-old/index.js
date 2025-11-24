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
    getArrayOfCommentsUnderWhichAliasCommentedAtSpecificVerseSectionInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsOfCommentsAtVerseSectionInParent,
    getComment, 
    
} = require("./commentRetrieval.js");

const { 
    editComment, 
    updateAllCommentIndexes, 
    updateCommentIndexesAtParent 
} = require("./commentModification.js");

const { 
    deleteComment, 
    deleteAllCommentsOfAlias, 
    deleteAllCommentsOfParent
} = require("./commentDeletion.js");

module.exports = {
    addComment,
    
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
    
    
	submitComment, 
    addOrApproveComment, 

    getArrayOfCommentsUnderWhichAliasCommentedAtSpecificVerseSectionInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsOfCommentsAtVerseSectionInParent
};