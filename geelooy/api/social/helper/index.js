/**
 * B"H
 * Main Awtsmoos helper index.
 * Consolidates and exports core functionalities.
 */

// General Utilities
var { loggedIn, er } = require("./general.js");

// Mail (Assuming unchanged)
var {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead,
    deleteThread,
    saveSettings,
    getSettings,
    approveSender,
    getUnreadCount 
} = require("./mail.js");

// Comments (Assuming largely unchanged, but check dependencies like deleteAllCommentsOfParent)
var {
    addComment, getComment, deleteComment, updateAllCommentIndexes,
    addCommentIndexToAlias, deleteAllCommentsOfAlias, deleteAllCommentsOfParent,
    editComment, denyComment, getSubmittedComments, approveComment,
    updateCommentIndexesAtParent, submitComment, addOrApproveComment,
    getCommentsByAliasAtVerseSection, getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    addLotsOfCommentsToPostByVerseSections
    // Removed getComment duplicates
} = require("./comments/index.js");

// Posts (Now Series-Centric)
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
    getPostsByProperty       // Renamed/Rewritten
    // Removed old post functions
} = require("./post/index.js");

// Heichel (Assuming unchanged)
var {
    verifyHeichelAuthority, updateHeichel, getHeichel, getHeichelos,
    deleteHeichel, verifyHeichelViewAuthority, createHeichel,
    getHeichelEditors, removeHeichelEditor, addHeichelEditor,
	generateHeichelId
} = require("./heichel.js");

// Series (Rewritten)
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