//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionSingleLoad
 * @description Verifies authority and loads the filtered comment array for deleteComment (seam-split from commentDeletionSingle.js).
 */

	const { er } = require("../general.js");
	const { verifyHeichelAuthority } = require("../heichel.js");
	const { verifyAliasOwnership } = require("../alias.js");
	const { getAliasCommentFilePath } = require("./commentPaths.js");

async function loadCommentForDeletion({ $i, commentId, aliasId, parentType, parentId, heichelId, postId, seriesId, verseSection, userid }) {
        // 1. Verify Ownership/Authority (Similar to edit)
        // Allow author or admin/moderator to delete.
        const owns = await verifyAliasOwnership(aliasId, $i, userid);
        let hasAdminAuth = false;
        if (!owns) {
            hasAdminAuth = await verifyHeichelAuthority({ heichelId, aliasId: $i.awtsmoosSession?.user?.adminAlias || null, $i, permissionLevel: 'moderator' }); // Fictional check
            if (!hasAdminAuth) {
                 return er("You do not have permission to delete this comment.", { code: "DELETE_FORBIDDEN", aliasId, userid });
            }
        }

        // 2. Get Path
        const aliasCommentFilePath = getAliasCommentFilePath({
            heichelId, seriesId, parentId, aliasId, parentType, postId
        });
        if (!aliasCommentFilePath) {
            return er("Could not determine comment file path.", { code: "PATH_ERROR" });
        }

        // 3. Retrieve the comment array for the verse section
        let commentsArray = await $i.db.getObjectKey(aliasCommentFilePath, verseSection);
        if (!Array.isArray(commentsArray)) {
             // Maybe the comment/file was already deleted? Treat as success (idempotent).
            return { success: true, message: "Comment likely already deleted (array not found)." };
        }

        // 4. Remove the comment from the array
        let commentFound = false;
        const updatedCommentsArray = commentsArray.filter(shtar => {
            if (shtar && shtar.id === commentId) {
                commentFound = true;
                return false; // Exclude the comment
            }
            return true; // Keep other comments
        });

        if (!commentFound) {
            // Comment ID wasn't in the expected array. Idempotency: treat as success.
             return { success: true, message: "Comment likely already deleted (ID not found in array)." };
        }
		return { aliasCommentFilePath, updatedCommentsArray };
}

module.exports = {
	loadCommentForDeletion,
};
