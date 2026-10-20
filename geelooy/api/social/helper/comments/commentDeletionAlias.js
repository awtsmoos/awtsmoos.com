//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionAlias
 * @description RESIDUE: deleteAllCommentsOfAlias plus its verbatim wiring exceeds the cap by a few lines (split from commentDeletion.js, verbatim).
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
	const { deleteAliasFileAndCleanup } = require("./commentDeletionAliasCore.js");


/**
 * @method deleteAllCommentsOfAlias
 * @description Deletes all comments by a specific alias for a specific parent.
 * @returns {Object} Deletion result.
 */
async function deleteAllCommentsOfAlias({
    $i,
    aliasId,    // The author whose comments to delete
    parentType,
    parentId,
    heichelId,
    postId,     // Required if parentType is "comment"
    seriesId,
    // Verification:
    userid
}) {
     // Input Validation & Data Extraction
     if (!aliasId) aliasId = $i.$_DELETE?.aliasId;
     if (!parentType) parentType = $i.$_DELETE?.parentType || "post";
     if (!parentId) parentId = $i.$_DELETE?.parentId;
     if (!heichelId) heichelId = $i.$_DELETE?.heichelId;
     if (!seriesId) seriesId = $i.$_DELETE?.seriesId;
     if (parentType === "comment" && !postId) postId = $i.$_DELETE?.postId;
     if (!userid) userid = $i.awtsmoosSession?.user?.id || $i.moch?.userid;

     // Basic validation
     if (!aliasId || !parentType || !parentId || !heichelId || !seriesId) {
         return er("Missing required parameters for deleteAllCommentsOfAlias", { aliasId, /*...*/ });
     }
     if (parentType === "comment" && !postId) {
          return er("postId is required when parentType is 'comment'");
     }
     if (!userid) return er(NO_LOGIN);

    try {
         // 1. Verify Authority (Admin/Mod should do this)
         const hasAdminAuth = await verifyHeichelAuthority({ heichelId, aliasId: $i.awtsmoosSession?.user?.adminAlias || null, $i, permissionLevel: 'moderator' }); // Fictional check
         if (!hasAdminAuth) {
              return er("You do not have permission to delete all comments of this alias.", { code: "DELETE_ALL_FORBIDDEN", aliasId, userid });
         }

        // 2. Get Path to the alias's comment file
        const aliasCommentFilePath = getAliasCommentFilePath({
            heichelId, seriesId, parentId, aliasId, parentType, postId
        });
        if (!aliasCommentFilePath) {
            return er("Could not determine comment file path.", { code: "PATH_ERROR" });
        }

		let deletedPaths = await deleteAliasFileAndCleanup({ $i, aliasId, heichelId, seriesId, aliasCommentFilePath });


        return {
            success: true,
            message: `All comments by alias ${aliasId} on parent ${parentId} deleted successfully.`,
            details: {
                deletedPaths
            }
        };

    } catch (e) {
        console.error(`Error deleting all comments for alias ${aliasId} on parent ${parentId}:`, e);
        return er("Internal server error during bulk alias comment deletion.", { details: e.stack });
    }
}

module.exports = {
	deleteAllCommentsOfAlias,
};
