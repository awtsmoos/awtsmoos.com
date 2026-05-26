//--- START OF NEW FILE commentModification.js ---

/**
 * B"H
 * Modification refines existence, elevating it through the Awtsmoos’s eternal renewal.
 * Refactored for simpler structure.
 */

const {
    NO_LOGIN,
    sp
} = require("../_awtsmoos.constants.js");

const {
    er,
    myOpts
} = require("../general.js");

const {
    verifyHeichelAuthority
} = require("../heichel.js");

const {
    verifyAliasOwnership // Still needed to ensure editor owns the alias
} = require("../alias.js");

const {
    getAliasCommentFilePath // New path function
} = require("./commentPaths.js");

/**
 * B"H
 * @function parseDayuhVessel
 * @description Parses edited dayuh payloads before storing them.
 * @param {any} dayuh Raw dayuh body.
 * @returns {object|undefined} Parsed dayuh object, or undefined.
 */
function parseDayuhVessel(dayuh) {
    if (!dayuh) return undefined;
    if (typeof dayuh === "object") return dayuh;
    if (typeof dayuh !== "string") return undefined;
    try {
        const parsed = JSON.parse(dayuh);
        return parsed && typeof parsed === "object" ? parsed : undefined;
    } catch (_) {
        return undefined;
    }
}

// Note: addCommentIndexToAlias might not be needed here anymore,
// unless editing could change the series association (unlikely).

/**
 * @method editComment
 * @description Edits an existing comment's content or dayuh.
 * Requires precise identification of the comment via context.
 * @returns {Object} Edit result.
 */
async function editComment(
    {
        $i,
        commentId, // ID of the comment to edit
        // Context to find the comment:
        aliasId,   // Author of the comment
        parentType,
        parentId,
        heichelId,
        postId,    // Required if parentType is "comment"
        seriesId,
        verseSection, // The verse section the comment belongs to
        // New data:
        newContent,
        newDayuh,
        // Verification:
        userid // ID of the user attempting the edit
    }
) {
    // Input Validation & Data Extraction from request ($i.$_PUT assumed)
    if (!commentId) commentId = $i.$_PUT?.commentId;
    if (!aliasId) aliasId = $i.$_PUT?.aliasId;
    if (!parentType) parentType = $i.$_PUT?.parentType || "post";
    if (!parentId) parentId = $i.$_PUT?.parentId;
    if (!heichelId) heichelId = $i.$_PUT?.heichelId;
    if (!seriesId) seriesId = $i.$_PUT?.seriesId;
    if (parentType === "comment" && !postId) postId = $i.$_PUT?.postId;
    if (verseSection === undefined || verseSection === null) verseSection = $i.$_PUT?.verseSection ?? "root";

    if (!newContent && !newDayuh) { // Check if new data provided in PUT body
        newContent = $i.$_PUT?.content;
        newDayuh = $i.$_PUT?.dayuh;
    }
    newDayuh = parseDayuhVessel(newDayuh);
     if (!userid) userid = $i.awtsmoosSession?.user?.id || $i.moch?.userid;

    // Basic validation
    if (!commentId || !aliasId || !parentType || !parentId || !heichelId || !seriesId) {
        return er("Missing required parameters for editComment", { commentId, aliasId, /*...*/ });
    }
    if (parentType === "comment" && !postId) {
         return er("postId is required when parentType is 'comment'");
    }
     if (!userid) return er(NO_LOGIN);
    if (newContent === undefined && newDayuh === undefined) {
        return er("No new content or dayuh provided for editing.", { code: "NO_EDIT_DATA" });
    }

    try {
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

    } catch (e) {
        console.error(`Error editing comment ${commentId}:`, e);
         if (e.code === 'NOT_FOUND' || e.code === 404) {
            return er("Comment data source not found.", { code: "DB_READ_ERROR", details: e });
         }
        return er("Internal server error during comment edit.", { details: e.stack });
    }
}


// --- Index Update Functions (Potentially Obsolete/Simplified) ---

/**
 * @method updateAllCommentIndexes (REVISIT / LIKELY OBSOLETE)
 * @description Original purpose was to rebuild complex indexes. With the new structure,
 * this is likely unnecessary unless the `commentsOfAliasByHeichelAndSeries` index
 * needs rebuilding for some reason.
 * @param {Object} params - Parameters for updating.
 * @returns {Object} Update result.
 */
async function updateAllCommentIndexes({ $i, aliasId, heichelId, userid }) {
    // This function's logic was tightly coupled to the old structure.
    // Re-evaluate if any global index rebuilding is needed for the new structure.
    // If only the `commentsOfAliasByHeichelAndSeries` needs checking, the logic
    // would involve listing all series an alias *actually* commented in (by checking files)
    // and comparing/updating the index file. This seems like a rare maintenance task.
    console.warn("updateAllCommentIndexes is likely obsolete with the new structure and needs review.");
    return {
         warning: "This function may be obsolete or needs significant rework for the new data structure.",
         code: "OBSOLETE_FUNCTION?"
        };
    // Original logic commented out:
    /*
    // ... verification ...
    // ... determine link (atPost/atComment) ...
    // ... get list of parent IDs ...
    // ... loop through parent IDs ...
        // updateCommentIndexesAtParent(...)
    // ... return results ...
    */
}

/**
 * @method updateCommentIndexesAtParent (REVISIT / LIKELY OBSOLETE)
 * @description Original purpose: update indexes for a specific parent. Likely obsolete.
 * @param {Object} params - Parameters for updating.
 * @returns {Object} Update result.
 */
async function updateCommentIndexesAtParent({ $i, aliasId, parentId, parentType, postId, heichelId, userid }) {
     console.warn("updateCommentIndexesAtParent is likely obsolete with the new structure and needs review.");
     return {
          warning: "This function may be obsolete or needs significant rework for the new data structure.",
          code: "OBSOLETE_FUNCTION?"
         };
    // Original logic commented out:
    /*
    // ... determine link ...
    // ... get old path to comment IDs (e.g., .../author/{aliasId}) ...
    // ... get list of comment IDs ...
    // ... loop through IDs ...
        // addCommentIndexToAlias(...) // This itself changed
    // ... return results ...
    */
}


module.exports = {
    editComment,
    updateAllCommentIndexes, // Expose if determined necessary after review
    updateCommentIndexesAtParent // Expose if determined necessary after review
};
//--- END OF NEW FILE commentModification.js ---
