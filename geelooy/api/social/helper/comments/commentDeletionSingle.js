//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionSingle
 * @description RESIDUE: deleteComment is one indivisible verbatim function (split from commentDeletion.js).
 */

const path = require("path"); // For dirname

const {
    er,
    myOpts
} = require("../general.js");
var NO_LOGIN = {
    message: "You're not logged in"
}

const {
    verifyHeichelAuthority // For permission checks
} = require("../heichel.js");

const {
    verifyAliasOwnership
} = require("../alias.js");

const {
    // New path functions
    getAliasCommentFilePath,
    getParentCommentsBasePath,
    getListOfPostsOrCommentsInSeriesPath,
    getPathAtSeries,
    commentsOfAliasByHeichelAndSeries, // For index cleanup
    // Utility
    getConditionalPathIfPostOrComment
} = require("./commentPaths.js");

	const { checkAndDeleteEmptyPathRecursive } = require("./commentDeletionCleanup.js");

	const { removeSeriesFromAliasIndex } = require("./commentDeletionIndexRemove.js");

	const { checkAliasHasAnyCommentsInSeries } = require("./commentDeletionIndexCheck.js");
	const { loadCommentForDeletion } = require("./commentDeletionSingleLoad.js");

	const { storeCommentDeletion } = require("./commentDeletionSingleStore.js");

// --- Main Deletion Functions ---

/**
 * @method deleteComment
 * @description Deletes a specific comment and performs necessary cleanup.
 * @returns {Object} Deletion result.
 */
async function deleteComment(
    {
        $i,
        commentId, // ID of the comment to delete
        // Context to find the comment:
        aliasId,
        parentType,
        parentId,
        heichelId,
        postId, // Required if parentType is "comment"
        seriesId,
        verseSection,
        // Verification:
        userid
    }
) {
    // Input Validation & Data Extraction
    if (!commentId) commentId = $i.$_DELETE?.commentId;
    if (!aliasId) aliasId = $i.$_DELETE?.aliasId;
    if (!parentType) parentType = $i.$_DELETE?.parentType || "post";
    if (!parentId) parentId = $i.$_DELETE?.parentId;
    if (!heichelId) heichelId = $i.$_DELETE?.heichelId;
    if (!seriesId) seriesId = $i.$_DELETE?.seriesId;
    if (parentType === "comment" && !postId) postId = $i.$_DELETE?.postId;
    if (verseSection === undefined || verseSection === null) verseSection = $i.$_DELETE?.verseSection ?? "root";
    if (!userid) userid = $i.awtsmoosSession?.user?.id || $i.moch?.userid;

    // Basic validation
    if (!commentId || !aliasId || !parentType || !parentId || !heichelId || !seriesId) {
        return er("Missing required parameters for deleteComment", { commentId, aliasId, /*...*/ });
    }
    if (parentType === "comment" && !postId) {
         return er("postId is required when parentType is 'comment'");
    }
    if (!userid) return er(NO_LOGIN);


    try {
		const loaded = await loadCommentForDeletion({ $i, commentId, aliasId, parentType, parentId, heichelId, postId, seriesId, verseSection, userid });
		if (!loaded.updatedCommentsArray) return loaded;
		const { aliasCommentFilePath, updatedCommentsArray } = loaded;
		const deletedPaths = await storeCommentDeletion({ $i, aliasId, aliasCommentFilePath, verseSection, updatedCommentsArray, heichelId, seriesId, parentType, postId });

        return {
            success: true,
            message: `Comment ${commentId} deleted successfully.`,
            details: {
                deletedPaths
            }
        };

    } catch (e) {
        console.error(`Error deleting comment ${commentId}:`, e);
         if (e.code === 'NOT_FOUND' || e.code === 404) {
            // If the alias file or key wasn't found during the process, it might mean it was already deleted.
            return er("Comment or its container not found, likely already deleted.", { code: "DELETE_NOT_FOUND", details: e });
         }
        return er("Internal server error during comment deletion.", { details: e.stack });
    }
}

module.exports = {
	deleteComment,
};
