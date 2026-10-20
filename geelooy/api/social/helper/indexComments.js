//B"H
//Blessed is He
//Boruch Hashem


/**
 * Comments slice of the helper index.
 * Split sibling of index.js (verbatim relocation).
 */

var {
    addComment, getComment, deleteComment, updateAllCommentIndexes,
    addCommentIndexToAlias, deleteAllCommentsOfAlias, deleteAllCommentsOfParent,
    editComment, denyComment, getSubmittedComments, approveComment,
    updateCommentIndexesAtParent, submitComment, addOrApproveComment,
    getCommentsByAliasAtVerseSection, getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    addLotsOfCommentsToPostByVerseSections
 
} = require("./comments/index.js");

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
