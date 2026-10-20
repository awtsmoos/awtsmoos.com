//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModificationEditApply
 * @description Verifies authority, finds and updates the comment and writes it back for editComment (seam-split from commentModificationEdit.js).
 */

	const { er } = require("../general.js");
	const { verifyHeichelAuthority } = require("../heichel.js");
	const { verifyAliasOwnership } = require("../alias.js");
	const { getAliasCommentFilePath } = require("./commentPaths.js");

async function applyCommentEdit({ $i, commentId, aliasId, parentType, parentId, heichelId, postId, seriesId, verseSection, newContent, newDayuh, userid }) {
        // 1. Verify Ownership/Authority
        // Only the original author (or perhaps an admin/moderator) should edit.
        // Let's assume for now only the author can edit their own comment.
        const owns = await verifyAliasOwnership(aliasId, $i, userid);
        if (!owns) {
            // Check for moderator/admin authority (example)
            const hasAdminAuth = await verifyHeichelAuthority({ heichelId, aliasId: $i.awtsmoosSession?.user?.adminAlias || null, $i, permissionLevel: 'moderator' }); // Fictional check
            if (!hasAdminAuth) {
                 return er("You do not have permission to edit this comment.", { code: "EDIT_FORBIDDEN", aliasId, userid });
            }
        }

        // 2. Get Path
        const aliasCommentFilePath = getAliasCommentFilePath({
            heichelId, seriesId, parentId, aliasId, parentType, postId
        });
        if (!aliasCommentFilePath) {
            return er("Could not determine comment file path.", { code: "PATH_ERROR" });
        }

        // 3. Retrieve the specific comment array
        let commentsArray = await $i.db.getObjectKey(aliasCommentFilePath, verseSection);
        if (!Array.isArray(commentsArray)) {
            return er("Comment data not found or invalid.", { code: "COMMENT_ARRAY_NOT_FOUND", path: aliasCommentFilePath, key: verseSection });
        }

        // 4. Find the comment and update it
        let commentFound = false;
        let updatedShtar = null;
        const updatedCommentsArray = commentsArray.map(shtar => {
            if (shtar && shtar.id === commentId) {
                commentFound = true;
                // Create updated object
                updatedShtar = {
                    ...shtar, // Keep original fields like author, timestamp, id
                    ...(newContent !== undefined && { content: newContent }), // Update content if provided
                    ...(newDayuh !== undefined && { dayuh: newDayuh }),       // Update dayuh if provided
                    lastEditedTimestamp: Date.now(), // Add edit timestamp
                    lastEditedByUserId: userid // Track editor
                };
                return updatedShtar;
            }
            return shtar; // Return unchanged comment
        });

        if (!commentFound) {
            return er("Comment ID not found within the specified context.", { code: "COMMENT_ID_NOT_FOUND", commentId, path: aliasCommentFilePath, key: verseSection });
        }

        // 5. Write the modified array back
        var writeResult = await $i.db.setObjectKey(aliasCommentFilePath, verseSection, updatedCommentsArray);
        if (writeResult.error) {
            throw writeResult.error; // Let catch block handle DB errors
        }

        return {
            success: true,
            message: "Comment edited successfully!",
            details: {
                id: commentId,
                updatedFields: {
                    content: newContent !== undefined,
                    dayuh: newDayuh !== undefined
                },
                // Optionally return the updated shtar (be mindful of data size)
                // updatedShtar: updatedShtar
            }
        };
}

module.exports = {
	applyCommentEdit,
};
