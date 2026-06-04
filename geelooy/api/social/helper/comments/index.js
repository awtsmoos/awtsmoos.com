/**
 * B"H
 * The Awtsmoos unifies all comment vessels into one practical API surface.
 */

const {
    addComment,
    submitComment,
    addOrApproveComment,
    addCommentIndexToAlias,
    addLotsOfCommentsToPostByVerseSections
} = require("./commentCreation.js");

const { approveComment, denyComment, getSubmittedComments } = require("./commentModeration.js");

const {
    getCommentsByAliasAtVerseSection,
    getAllCommentsByAliasInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    getComment
} = require("./commentRetrieval.js");

const { editComment, updateAllCommentIndexes, updateCommentIndexesAtParent } = require("./commentModification.js");
const { deleteComment, deleteAllCommentsOfAlias, deleteAllCommentsOfParent } = require("./commentDeletion.js");

module.exports = {
    addComment,
    submitComment,
    addOrApproveComment,
    addCommentIndexToAlias,
    addLotsOfCommentsToPostByVerseSections,
    approveComment,
    denyComment,
    getSubmittedComments,
    getComment,
    getCommentsByAliasAtVerseSection,
    getAllCommentsByAliasInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    editComment,
    updateAllCommentIndexes,
    updateCommentIndexesAtParent,
    deleteComment,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent
};
