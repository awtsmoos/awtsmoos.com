/**
 * B"H
 * Main Awtsmoos helper index.
 * Consolidates and exports core functionalities.
 */

// General Utilities
var { loggedIn, er } = require("./general.js");

// Mail 
var {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead,
    deleteThread,
    saveSettings,
    getSettings,
    approveSender,
    getUnreadCount,
    subscribeToPush,
    getLatestNotification
} = require("./mail.js");

// Comments 
var {
    addComment, getComment, deleteComment, updateAllCommentIndexes,
    addCommentIndexToAlias, deleteAllCommentsOfAlias, deleteAllCommentsOfParent,
    editComment, denyComment, getSubmittedComments, approveComment,
    updateCommentIndexesAtParent, submitComment, addOrApproveComment,
    getCommentsByAliasAtVerseSection, getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    addLotsOfCommentsToPostByVerseSections
 
} = require("./comments/index.js");

// Posts 
var {
    getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getHeichelosOfPostsOfAlias,
	getSeriesCreatedOfAliasInHeichel,
	getHeichelosOfSeriesCreatedOfAlias,
	getHeichelosOfCommetsOfAlias,
	getSeriesInHeichelOfCommetsOfAlias,
	getPostsOfCommentsInSeriesOfAlias,

    
    addPostToSeries,         // Renamed/Rewritten
    editPostInSeries,        // Renamed/Rewritten
    deletePostFromSeries,    // Renamed/Rewritten
    getPostFromSeries,       // Renamed/Rewritten
    getPostsInSeries,        // Renamed/Rewritten
    getPostsByProperty,      // Renamed/Rewritten
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost

} = require("./post/index.js");

// Heichel
var {
    verifyHeichelAuthority, updateHeichel, getHeichel, getHeichelos,
    deleteHeichel, verifyHeichelViewAuthority, createHeichel,
    getHeichelEditors, removeHeichelEditor, addHeichelEditor,
	generateHeichelId
} = require("./heichel.js");

var {
    ROLE_NAMES,
    SETTING_DEFAULTS,
    getHeichelRoleList,
    addHeichelRoleMember,
    removeHeichelRoleMember,
    getHeichelSubmissionSettings,
    updateHeichelSubmissionSettings
} = require("./heichelRoles.js");

// Series
var {
    makeNewSeries,
    editSeriesDetails,
    getSeries,
    getSubSeries,
    deleteSeriesFromHeichel,
    changeSubSeriesFromOneSeriesToAnother,
    editSubSeriesInSeries,
    getAllSeriesInHeichel,
    getSeriesByProperty
    // Removed old/deprecated series functions
} = require("./series.js");

// Alias (Assuming unchanged)
var {
    getAliasesDetails, getAliasIDs, createNewAlias, verifyAliasOwnership,
    verifyAlias, getDetailedAlias, getDetailedAliasesByArray, deleteAlias,
    updateAlias, getAlias
} = require("./alias.js");

// Export consolidated API
module.exports = {
    // General
    loggedIn,
    er,

    // Mail
    getMail,
    deleteMail,
    setEmailAsRead,
    sendMail,
    deleteThread,
    saveSettings,
    getSettings,
    approveSender,
    getUnreadCount ,
    subscribeToPush,
    getLatestNotification,

    // Alias
    getAliasesDetails,
    getAliasIDs,
    createNewAlias,
    verifyAliasOwnership,
    verifyAlias,
    getDetailedAlias,
    getDetailedAliasesByArray,
    deleteAlias,
    updateAlias,
    getAlias,

    // Heichel
    verifyHeichelAuthority,
    updateHeichel,
    getHeichel,
    getHeichelos,
    deleteHeichel,
    verifyHeichelViewAuthority,
    createHeichel,
    getHeichelEditors,
    removeHeichelEditor,
    addHeichelEditor,

	generateHeichelId,
	

    // Series (New API)
    makeNewSeries,
    editSeriesDetails,
    getSeries,
    getSubSeries,
    deleteSeriesFromHeichel,
    changeSubSeriesFromOneSeriesToAnother,
    editSubSeriesInSeries,
    getAllSeriesInHeichel,
    getSeriesByProperty,

    // Posts (New Series-Centric API)
    addPostToSeries,
    editPostInSeries,
    deletePostFromSeries,
    getPostFromSeries,
    getPostsInSeries,
    getPostsByProperty,
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost,

    // Comments
    addComment,
    getComment, // Keep one reference
    deleteComment,
    updateAllCommentIndexes, // Check if still relevant
    addCommentIndexToAlias,  // Check if still relevant
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent, // Ensure this uses seriesId where needed
    editComment,
    denyComment,
    getSubmittedComments,
    approveComment,
    updateCommentIndexesAtParent, // Check if still relevant
    submitComment,
    addOrApproveComment,
    getCommentsByAliasAtVerseSection,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,

    addLotsOfCommentsToPostByVerseSections,



    getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getHeichelosOfPostsOfAlias,
	getSeriesCreatedOfAliasInHeichel,
	getHeichelosOfSeriesCreatedOfAlias,
	getHeichelosOfCommetsOfAlias,
	getSeriesInHeichelOfCommetsOfAlias,
	getPostsOfCommentsInSeriesOfAlias
};