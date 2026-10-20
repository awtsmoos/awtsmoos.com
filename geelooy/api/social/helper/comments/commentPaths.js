//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentPaths
 * @description Barrel for comment paths: re-exports the identical surface from the split sibling modules.
 */

	const { getPathAtSeries, getConditionalPathIfPostOrComment, getListOfPostsOrCommentsInSeriesPath } = require("./commentPathsCore.js");

	const { getParentCommentsBasePath, getAliasCommentFilePath } = require("./commentPathsParent.js");

	const { commentsOfAliasByHeichelAndSeries, commentsOfAliasByHeichelAndSeriesAndParent } = require("./commentPathsIndex.js");

	const { getSubmittedCommentPath } = require("./commentPathsSubmitted.js");

// --- Deprecated Path Functions (Old Structure) ---
/*
function getShtarPath(...) { // REMOVED - Concept replaced by getAliasCommentFilePath + key
    // ... old logic ...
}
function getAuthorPath(...) { // REMOVED - Concept replaced by getAliasCommentFilePath
    // ... old logic ...
}
function getAliasesCommentsPath(...) { // REMOVED - Concept replaced by getParentCommentsBasePath
    // ... old logic ...
}
function getAllVerseSectionsThatHaveAtLeastOneAuthorPath(...) { // REMOVED - Logic replaced by iterating keys/files
    // ... old logic ...
}
function getAliasesAtVerseSectionPath(...) { // REMOVED - Logic replaced by iterating files/checking keys
    // ... old logic ...
}
function getParentPath(...) { // Equivalent to getParentCommentsBasePath now
    // ... old logic ...
}
*/

module.exports = {
    // Core Paths
    getPathAtSeries,
    getListOfPostsOrCommentsInSeriesPath,
    getParentCommentsBasePath, // New
    getAliasCommentFilePath,   // New

    // Indexing
    commentsOfAliasByHeichelAndSeries,
    commentsOfAliasByHeichelAndSeriesAndParent,

    // Submission
    getSubmittedCommentPath,

    // Utility (may be useful internally in other modules)
    getConditionalPathIfPostOrComment
};
