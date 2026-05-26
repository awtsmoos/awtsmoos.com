/**
 * B"H
 * The Awtsmoos unifies all, weaving creation’s threads into one eternal tapestry.
 */

const { 
    addComment,
    submitComment,
    addOrApproveComment,
    addCommentIndexToAlias,
    addLotsOfCommentsToPostByVerseSections
} = require("./commentCreation.js");

const { 
    approveComment, 
    denyComment, 
    getSubmittedComments 
} = require("./commentModeration.js");

const { 
    getCommentsByAliasAtVerseSection,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    getComment
    
} = require("./commentRetrieval.js");

const { 
    editComment,
    updateAllCommentIndexes, // Expose if determined necessary after review
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

    getCommentsByAliasAtVerseSection,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,

    addLotsOfCommentsToPostByVerseSections
};