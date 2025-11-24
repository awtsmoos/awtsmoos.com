/**
 * B"H
 */

var {
    loggedIn,
    er
} = require("./general.js");

var {
	getMail,
	deleteMail,
	sendMail,
	setEmailAsRead
} = require("./mail.js")
var {
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
    getComment
} = require("./comments/index.js");

var {
	detailedPostOperation,
    getPost,
	addPostToHeichel,
	getPostsInHeichel,
	getPostByProperty

} = require("./post/index.js");


var {
	verifyHeichelAuthority,
	updateHeichel,
	getHeichel,
    getHeichelos,
	deleteHeichel,
    verifyHeichelViewAuthority,
	createHeichel,
	getHeichelEditors,

	removeHeichelEditor,
    addHeichelEditor

} = require("./heichel.js");

var {
	getAllSeriesInHeichel,
	getSeries,
    getSubSeriesInHeichel,
	deleteContentFromSeries,
    deleteSeriesFromHeichel,
    editSeriesDetails,
    makeNewSeries,
	addContentToSeries,
	getSeriesByProperty,
	traverseSeries,
	checkParentIDsAndAdd,
	getSubSeries,
	changeSubSeriesFromOneSeriesToAnother,
	editSubSeriesInSeries,
	editPostsInSeries
} = require("./series.js");

var {
	getAliasesDetails,
    getAliasIDs,
    createNewAlias,
    verifyAliasOwnership,
    verifyAlias,
	getDetailedAlias,
	
    
    getDetailedAliasesByArray,
	deleteAlias,
    updateAlias,
	getAlias
} = require("./alias.js");

module.exports = {
	getMail,
	deleteMail,
	setEmailAsRead,
	sendMail,
    getAliasesDetails,
    getAliasIDs,
    createNewAlias,
    verifyAliasOwnership,
    verifyAlias,
	getDetailedAlias,
    
	
	

	deleteAlias,
    updateAlias,
	getAlias,


	getAllSeriesInHeichel,
	getSeries,
    getSubSeriesInHeichel,
	deleteContentFromSeries,
    deleteSeriesFromHeichel,
    editSeriesDetails,
    makeNewSeries,
	addContentToSeries,


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


	detailedPostOperation,
    getPost,
	addPostToHeichel,
	getPostByProperty,
	getPostsInHeichel,

	getSeriesByProperty,

	loggedIn,
    er,
	editPostsInSeries,
	editSubSeriesInSeries,
	
	getSubSeries,
	traverseSeries,
	checkParentIDsAndAdd,

	
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
    getComment
};





   
    
