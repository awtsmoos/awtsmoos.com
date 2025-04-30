//--- START OF NEW FILE commentCreation.js ---

/**
 * B"H
 * Comments are born, infused with the Ohr Ein Sof, channeled through the Kav into Atzilus.
 * Refactored for simpler structure.
 */

const {
    NO_LOGIN,
    sp
} = require("../_awtsmoos.constants.js");

const {
    loggedIn,
    er,
    myOpts
} = require("../general.js");

const {
    verifyHeichelAuthority
} = require("../heichel.js");

const {
    verifyAliasOwnership
} = require("../alias.js");

const {
    // New path functions
    getAliasCommentFilePath,
    commentsOfAliasByHeichelAndSeries,
    getSubmittedCommentPath // Unchanged for submission logic
} = require("./commentPaths.js");

/**
 * @method addComment
 * @description Initiates comment creation, verifying ownership and authority. (Checks remain similar)
 * @returns {Object} Success or error response.
 */
async function addComment(
    {
        $i,
        parentType = "post", // "post" or "comment"
        parentId, // ID of the direct parent (post or comment)
        heichelId,
        aliasId, // Author's alias ID
        userid, // User ID for ownership verification
        postId, // Required only if parentType is "comment", the ID of the top-level post
        seriesId // Required: The series the parent belongs to
    }
) {
    try {
        // Input validation
        if (!parentType || !parentId || !heichelId || !aliasId || !seriesId) {
            return er("Missing required parameters for addComment", { parentType, parentId, heichelId, aliasId, seriesId });
        }
        if (parentType === "comment" && !postId) {
            return er("postId is required when parentType is 'comment'");
        }
        if (!userid) userid = $i.awtsmoosSession?.user?.id || $i.moch?.userid; // Example: Get user from session
        if (!userid) return er(NO_LOGIN);


        // Verify Alias Ownership
        var owns = await verifyAliasOwnership(aliasId, $i, userid);
        if (!owns) {
            return er("You don't have permission to post as this alias.", { aliasId, userid });
        }

        // Verify Heichel Authority (for direct posting/approval)
        var hasAuthority = await verifyHeichelAuthority({ heichelId, aliasId, $i });

        if (!hasAuthority) {
            // If no direct authority, submit for approval
            console.log(`Alias ${aliasId} lacks authority for ${heichelId}, submitting comment.`);
            return await submitComment({
                $i, parentType, parentId, heichelId, aliasId, userid, postId
            });
             /* // Original logic seemed to prevent submission if no auth, corrected above
             return er( {
                 message: "You don't have authority to post to this heichel",
                 code: "NO_AUTH"
             });
             */
        }

        // If has authority, add directly
        console.log(`Alias ${aliasId} has authority for ${heichelId}, adding comment directly.`);
        return await addOrApproveComment({
            $i, parentType, parentId, heichelId, aliasId, userid, postId, seriesId
        });

    } catch (e) {
        console.error("Error in addComment:", e);
        return er("Internal server error during comment addition.", { details: e.stack });
    }
}

/**
 * @method submitComment
 * @description Submits a comment for approval. (Logic mostly unchanged, uses getSubmittedCommentPath)
 * @returns {Object} Submission result.
 */
async function submitComment(
    {
        $i, parentType, parentId, heichelId, aliasId, userid, postId
    }
) {
    const { content, dayuh } = $i.$_POST; // Assuming data comes from POST
    const db = $i.db;
    const timestamp = Date.now();
    const commentId = "BH_tempComment_by_" + aliasId + "_at_" + timestamp;

    // Prepare comment data
    const commentData = {
        aliasId, parentId, parentType, content, dayuh, timestamp, userid, // Include userid?
        status: "submitted" // Mark as submitted
    };

    // Get the specific path for this submitted comment
    const submittedCommentSpecificPath = await getSubmittedCommentPath({
        parentType, heichelId, parentId, postId, commentId, $i, aliasId
    });
    if (typeof submittedCommentSpecificPath !== "string" || submittedCommentSpecificPath.error) {
        return submittedCommentSpecificPath; // Return error object if path generation failed
    }

    // Optional: Path to a general list of submissions for the parent (maybe for admins)
    const allSubmittedListPath = `${sp}/heichelos/${heichelId}/comments/submitted/list/${parentType}/${parentId}`; // Example path

    // Add metadata to the comment itself
    commentData.awtsmoosDayuh = {
        BH: "Boruch Hashem - Submitted",
        submittedCommentSpecificPath, // Path where this specific comment is stored
       // allSubmittedListPath, // Path where it might be listed
        parentId, parentType, postId, commentAliasId: aliasId, heichelId
    };

    try {
        // Write the detailed submitted comment data
        await db.write(submittedCommentSpecificPath, commentData);

        // Optionally, add a reference to the general list
        // await db.arrayAppend(allSubmittedListPath, { commentId, aliasId, timestamp }); // Example

        console.log(`Comment ${commentId} submitted successfully to ${submittedCommentSpecificPath}`);
        return {
            success: true,
            message: "Comment submitted for approval.",
            commentId,
            path: submittedCommentSpecificPath,
           // listPath: allSubmittedListPath
        };
    } catch (e) {
        console.error("Error writing submitted comment:", e);
        return er("Failed to write submitted comment.", { details: e.stack, path: submittedCommentSpecificPath });
    }
}

/**
 * @method addOrApproveComment
 * @description Core function to add a comment directly (or approve a submitted one - approval logic TBD).
 * Uses the new path structure and DB operations.
 * @returns {Object} Result of operation.
 */
async function addOrApproveComment(
    {
        $i,
        parentType, // "post" or "comment"
        parentId,   // ID of the direct parent
        heichelId,
        aliasId,    // Author alias
        userid,     // User ID (optional, for metadata)
        postId,     // Required if parentType is "comment"
        seriesId,   // Required: Series ID
        // For approval flow (future): submittedCommentData, submittedCommentPath
        isApproval = false
    }
) {
    try {
        // 1. Validate Input (Redundant checks removed, handled in addComment)
        const content = $i.$_POST.content; // Or from submittedCommentData if approval
        const dayuh = $i.$_POST.dayuh;     // Or from submittedCommentData if approval
        const verseSection = dayuh?.verseSection ?? $i.$_POST?.dayuh?.verseSection ?? "root"; // Default to "root"

        if (!content && !dayuh) {
            return er("Comment must have content or dayuh.", { code: "EMPTY_COMMENT" });
        }

        // 2. Prepare Shtar (Comment Data Object)
        const commentId = "BH_" + Date.now() + "_commentBy_" + aliasId;
        const shtar = {
            id: commentId,
            author: aliasId,
            parentType,
            parentId,
            postId: parentType === "post" ? parentId : postId, // Ensure postId is stored
            seriesId, // Store seriesId for context
            timestamp: Date.now(),
            verseSection, // Store verse section
            ...(content && typeof content === "string" && content !== "undefined" && { content }),
            ...(dayuh && typeof dayuh === "object" && { dayuh }),
            ...(userid && { addedByUserId: userid }) // Optional: track user if needed
        };

        // 3. Determine the Target Path (New Structure)
        const aliasCommentFilePath = getAliasCommentFilePath({
            heichelId, seriesId, parentId, aliasId, parentType, postId
        });
        if (!aliasCommentFilePath) {
            return er("Could not determine comment file path.", { code: "PATH_ERROR" });
        }

        // 4. Write to Database (Append to array within the object key)
        try {
            // We need an operation like "appendToArrayAtKey" or simulate it:
            // a. Get current array for the verseSection
            let currentComments = await $i.db.getObjectKey(aliasCommentFilePath, verseSection);

            // b. Initialize if it doesn't exist or isn't an array
            if (!Array.isArray(currentComments)) {
                currentComments = [];
            }

            // c. Append the new shtar
            currentComments.push(shtar);

            // d. Write the updated array back to the key
            var writeResult = await $i.db.setObjectKey(aliasCommentFilePath, verseSection, currentComments);

            if (writeResult.error) {
                throw writeResult.error; // Rethrow DB error
            }

            console.log(`Successfully added comment ${commentId} to ${aliasCommentFilePath} under key ${verseSection}`);

        } catch (dbError) {
            console.error("Database error adding comment:", dbError);
            return er("Database error: Could not append comment.", { code: "DB_WRITE_ERROR", details: dbError, path: aliasCommentFilePath, key: verseSection });
        }

        // 5. Update Indexes (Simplified)
        var indexResult = await addCommentIndexToAlias({
             $i, aliasId, heichelId, seriesId // Only need these for the series index now
        });

        if (indexResult.error) {
            // Log the error but don't necessarily fail the whole operation? Or should we roll back?
            console.error("Failed to update alias series index:", indexResult.error);
            // Decide on error handling strategy here. For now, return success with a warning.
             return {
                 warning: "Comment added, but failed to update alias series index.",
                 details: { id: commentId, indexError: indexResult.error }
             };
        }

        // 6. Handle Approval Flow Cleanup (Future)
        // if (isApproval && submittedCommentPath) {
        //     await $i.db.delete(submittedCommentPath);
        //     // Maybe remove from submission list too
        // }

        return {
            success: true,
            message: isApproval ? "Comment approved and added!" : "Comment added!",
            details: {
                id: commentId,
                path: aliasCommentFilePath,
                verseSection: verseSection
            }
        };

    } catch (e) {
        console.error("Error in addOrApproveComment:", e);
        return er("Internal server error during comment processing.", { details: e.stack });
    }
}

/**
 * @method addCommentIndexToAlias
 * @description Indexes that an alias commented in a specific series within a heichel. (Simplified)
 * @returns {Object} Indexing result.
 */
async function addCommentIndexToAlias({ $i, aliasId, heichelId, seriesId }) {
    try {
        // No need for ownership check here, assumed verified by caller (addComment)
        // No need for parentId, parentType, postId, verseSection, commentId for this specific index

        if (!aliasId || !heichelId || !seriesId) {
             return er("Missing parameters for alias index update.", { aliasId, heichelId, seriesId });
        }

        // Path to the list of series the alias commented on in this heichel
        const seriesIndexPath = commentsOfAliasByHeichelAndSeries({ aliasId, heichelId });
        if (!seriesIndexPath) {
             return er("Could not determine series index path.");
        }

        // Use a set-like operation if possible, otherwise read-check-append
        // Assuming db.syncKeyInObj adds the seriesId if not present (like adding to a set or list)
        var syncResult = await $i.db.syncKeyInObj(seriesIndexPath, seriesId); // Or equivalent db.addToListIfNotExists

        if (syncResult?.error) {
            console.error(`Failed to sync seriesId ${seriesId} in ${seriesIndexPath}:`, syncResult.error);
            return er("Database error updating series index.", { code: "DB_INDEX_ERROR", details: syncResult.error });
        }

        console.log(`Ensured series ${seriesId} is indexed for alias ${aliasId} in heichel ${heichelId}.`);
        return { success: true, details: syncResult }; // Return DB operation details

    } catch (e) {
        console.error("Error in addCommentIndexToAlias:", e);
        return er("Internal error updating alias index.", { details: e.stack });
    }
}

module.exports = {
    addComment,
    submitComment,
    addOrApproveComment,
    addCommentIndexToAlias // Exposed if needed elsewhere, otherwise internal helper
};
//--- END OF NEW FILE commentCreation.js ---