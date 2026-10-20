//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionParent
 * @description RESIDUE: deleteAllCommentsOfParent is one indivisible verbatim function (split from commentDeletion.js).
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
	const { deleteParentCommentsCore } = require("./commentDeletionParentCore.js");


/**
 * @method deleteAllCommentsOfParent
 * @description Deletes all comments (all alias files) under a specific parent.
 * @returns {Object} Deletion result.
 */
async function deleteAllCommentsOfParent(
    {
        $i,
        parentType,
        parentId,
        heichelId,
        postId,     // Required if parentType is "comment"
        seriesId,
        // Verification:
        userid,
        aliasId
    }
) {
    if(!aliasId) {
        aliasId = $i.$_DELETE.aliasId ||
            $i.$_POST.aliasId
    }
    if(!aliasId) {
        return er({
            message: "No alias ID",
            code: "MISSING_ALIAS"
        })
    }
     // Input Validation & Data Extraction
     if (!parentType) parentType = $i.$_DELETE?.parentType || "post";
     if (!parentId) parentId = $i.$_DELETE?.parentId;
     if (!heichelId) heichelId = $i.$_DELETE?.heichelId;
     if (!seriesId) seriesId = $i.$_DELETE?.seriesId;
     if (parentType === "comment" && !postId) postId = $i.$_DELETE?.postId;
     if (!userid) userid = $i.awtsmoosSession?.user?.id || $i.moch?.userid;

     // Basic validation
     if (!parentType || !parentId || !heichelId || !seriesId) {
         return er("Missing required parameters for deleteAllCommentsOfParent", { /*...*/ });
     }
     if (parentType === "comment" && !postId) {
          return er("postId is required when parentType is 'comment'");
     }
     if (!userid) return er(NO_LOGIN);

    try {
		const cleared = await deleteParentCommentsCore({ $i, aliasId, heichelId, userid, parentId, parentType, postId, seriesId });
		if (!cleared.deletedPaths) return cleared;
		const { deletedPaths, indexUpdateErrors } = cleared;


        return {
            success: true,
            message: `All comments on parent ${parentId} deleted successfully.`,
            details: {
                deletedPaths,
                indexUpdateErrors: indexUpdateErrors.length > 0 ? indexUpdateErrors : undefined
            }
        };

    } catch (e) {
        console.error(`Error deleting all comments for parent ${parentId}:`, e);
        return er("Internal server error during bulk parent comment deletion.", { details: e.stack });
    }
}

module.exports = {
	deleteAllCommentsOfParent,
};
