//--- START OF NEW FILE commentDeletion.js ---

/**
 * B"H
 * Deletion clears the old, making way for the Awtsmoos’s infinite recreation.
 * Refactored for simpler structure.
 */
const path = require("path"); // For dirname

const {
    sp
} = require("../_awtsmoos.constants.js");

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


// --- Helper Function for Cleanup ---

/**
 * @async
 * @function checkAndDeleteEmptyPathRecursive
 * @description Checks if a directory/path is empty (contains no files/subdirs according to db.get/count).
 * If empty, deletes it and recursively checks the parent directory.
 * Stops recursion at a specified base path or if a non-empty dir is found.
 * @param {string} currentPath - The path to check and potentially delete.
 * @param {string} stopAtBasePath - A base path component where recursion should stop (e.g., 'atSeries').
 * @param {Object} $i - The request/context object containing $i.db.
 * @param {Array} [deletedPaths=[]] - Accumulator for paths that were deleted.
 * @returns {Promise<{success: boolean, deletedPaths: Array<string>, error?: object}>}
 */
async function checkAndDeleteEmptyPathRecursive(currentPath, stopAtComponent, $i, deletedPaths = []) {
    if (!currentPath || currentPath === '/' || currentPath === '.' || currentPath.includes('..') || (stopAtComponent && path.basename(currentPath) === stopAtComponent)) {
        // Safety checks and stop condition
        return { success: true, deletedPaths };
    }

    try {
        // Check if empty. Use count or list depending on DB capability.
        // Let's assume db.count() returns count of entries (files/dirs) inside.
        const countResult = await $i.db.count(currentPath);

        if (countResult.error && !(countResult.error.code === 'NOT_FOUND' || countResult.error.code === 404) ) {
            console.error(`Error counting entries in ${currentPath}:`, countResult.error);
            return { success: false, deletedPaths, error: er("DB count error during cleanup", countResult.error) };
        }

        const isEmpty = countResult.success === 0 || countResult.error?.code === 'NOT_FOUND' || countResult.error?.code === 404;


        if (isEmpty) {
             // Attempt to delete the empty path (ignore if it was already not found)
             if (!(countResult.error?.code === 'NOT_FOUND' || countResult.error?.code === 404)) {
                const deleteResult = await $i.db.delete(currentPath);
                if (deleteResult.error) {
                    // Log error but potentially continue up the chain? Or stop? Stopping is safer.
                    console.error(`Error deleting empty path ${currentPath}:`, deleteResult.error);
                    return { success: false, deletedPaths, error: er("DB delete error during cleanup", deleteResult.error) };
                }
                deletedPaths.push(currentPath);
             } else {
             }


            // Recurse to parent directory
            const parentPath = path.dirname(currentPath);
            return await checkAndDeleteEmptyPathRecursive(parentPath, stopAtComponent, $i, deletedPaths);
        } else {
            // Path is not empty, stop cleanup for this branch
            return { success: true, deletedPaths };
        }
    } catch (e) {
        console.error(`Unexpected error during cleanup check for ${currentPath}:`, e);
        return { success: false, deletedPaths, error: er("Unexpected cleanup error", { details: e.stack }) };
    }
}


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

        // 5. Update the database
        let aliasFileIsEmpty = false;
        let deletedPaths = [];

        if (updatedCommentsArray.length > 0) {
            // If array still has comments, write it back
            const writeResult = await $i.db.setObjectKey(aliasCommentFilePath, verseSection, updatedCommentsArray);
            if (writeResult.error) throw writeResult.error; // Handle DB errors below
        } else {
            // Array is empty, delete the key itself
            const deleteKeyResult = await $i.db.deleteObjectKey(aliasCommentFilePath, verseSection);
            if (deleteKeyResult.error && !(deleteKeyResult.error.code === 'NOT_FOUND' || deleteKeyResult.error.code === 404)) {
                // Ignore "not found" errors for the key, but fail on others
                throw deleteKeyResult.error;
            }

            // Check if the entire alias file is now empty
            const remainingKeys = await $i.db.getObjectKeys(aliasCommentFilePath);
            if (remainingKeys.error) throw remainingKeys.error;

            if (!Array.isArray(remainingKeys.success) || remainingKeys.success.length === 0) {
                aliasFileIsEmpty = true;
                // Delete the alias file itself
                const deleteFileResult = await $i.db.delete(aliasCommentFilePath);
                 if (deleteFileResult.error && !(deleteFileResult.error.code === 'NOT_FOUND' || deleteFileResult.error.code === 404)) {
                     throw deleteFileResult.error;
                 }
                deletedPaths.push(aliasCommentFilePath);
            }
        }

        // 6. Perform Recursive Cleanup if Alias File was Deleted
        if (aliasFileIsEmpty) {
            const parentBasePath = path.dirname(aliasCommentFilePath);
            // Recursively check and delete empty parent directories, stopping at 'atSeries'
            const cleanupResult = await checkAndDeleteEmptyPathRecursive(parentBasePath, 'atSeries', $i);

            if (!cleanupResult.success) {
                // Log error but might continue with index update
                console.error("Error during directory cleanup:", cleanupResult.error);
            }
            deletedPaths = deletedPaths.concat(cleanupResult.deletedPaths);

            // 7. Update Alias Index (if parent structure up to series was potentially removed)
            // Check if the series folder itself was potentially deleted by cleanup
            const seriesBasePath = getPathAtSeries({ heichelId, seriesId });
            const seriesStillExists = await $i.db.exists(seriesBasePath); // Assumes db.exists check

            let needsIndexUpdate = false;
            if (seriesStillExists.error) {
                 console.error("Error checking series existence for index update:", seriesStillExists.error);
                 // Assume index update might be needed as a precaution? Or skip? Let's skip on error.
            } else if (!seriesStillExists.success) {
                 // If the whole series folder is gone, the alias definitely has no more comments there
                 needsIndexUpdate = true;
            } else {
                 // If series folder still exists, check if *this specific alias* has *any* other comment files *anywhere* in this series
                 // This is more complex - requires searching across all parentTypes/postIds/parentIds within the series for this alias.
                 // Simpler heuristic: If the cleanup reached and potentially deleted the `atPost/postId` or `atComment` directory,
                 // assume the index might need updating.
                 const parentListPath = getListOfPostsOrCommentsInSeriesPath({ heichelId, seriesId, parentType, postId });
                 if(cleanupResult.deletedPaths.some(p => p.startsWith(parentListPath))) {
                     // To be perfectly accurate, we'd need to search if the alias has *any* remaining files in the series.
                     // For now, let's trigger an index check/update if significant cleanup occurred.
                     // A more robust approach might involve a separate maintenance task.
                      // We need to check if the alias has ANY remaining comment file in this series
                      const hasMoreComments = await checkAliasHasAnyCommentsInSeries($i, aliasId, heichelId, seriesId);
                      if (hasMoreComments.error) {
                          console.error("Failed to check for remaining comments, skipping index update.", hasMoreComments.error);
                      } else if (!hasMoreComments.success) {
                          needsIndexUpdate = true;
                      }

                 }
            }


            if (needsIndexUpdate) {
                const indexUpdateResult = await removeSeriesFromAliasIndex($i, aliasId, heichelId, seriesId);
                if (indexUpdateResult.error) {
                    console.error("Failed to update alias series index:", indexUpdateResult.error);
                    // Non-fatal error?
                } else {
                    deletedPaths = deletedPaths.concat(indexUpdateResult.deletedPaths || []);
                }
            }
        }

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

        // 3. Delete the entire alias file
        const deleteFileResult = await $i.db.delete(aliasCommentFilePath);
         if (deleteFileResult.error && !(deleteFileResult.error.code === 'NOT_FOUND' || deleteFileResult.error.code === 404)) {
            // Fail if error is not 'not found'
             throw deleteFileResult.error;
         }
         if (!deleteFileResult.error) {
         } else {
         }


        // 4. Perform Recursive Cleanup
        let deletedPaths = (!deleteFileResult.error) ? [aliasCommentFilePath] : [];
        const parentBasePath = path.dirname(aliasCommentFilePath);
        const cleanupResult = await checkAndDeleteEmptyPathRecursive(parentBasePath, 'atSeries', $i);
        if (!cleanupResult.success) {
            console.error("Error during directory cleanup:", cleanupResult.error);
            // Decide if this should be fatal
        }
        deletedPaths = deletedPaths.concat(cleanupResult.deletedPaths);


         // 5. Update Alias Index (check if any remaining comments in series)
         const hasMoreComments = await checkAliasHasAnyCommentsInSeries($i, aliasId, heichelId, seriesId);
         if (hasMoreComments.error) {
             console.error("Failed to check for remaining comments, skipping index update.", hasMoreComments.error);
         } else if (!hasMoreComments.success) {
             const indexUpdateResult = await removeSeriesFromAliasIndex($i, aliasId, heichelId, seriesId);
             if (indexUpdateResult.error) {
                 console.error("Failed to update alias series index:", indexUpdateResult.error);
             } else {
                 deletedPaths = deletedPaths.concat(indexUpdateResult.deletedPaths || []);
             }
         }


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
         // 1. Verify Authority (Admin/Mod should do this)
         const hasAdminAuth = await verifyHeichelAuthority({ heichelId, aliasId, $i, permissionLevel: 'admin' }); // Higher level?
         if (!hasAdminAuth) {
              return er({
                message: "You do not have permission to delete all comments of this parent.",
                aliasId,
                heichelId,
                 code: "DELETE_PARENT_FORBIDDEN", parentId, userid 
            });
         }

        // 2. Get Path to the parent's comment base directory
        const parentBasePath = getParentCommentsBasePath({
            heichelId, seriesId, parentId, parentType, postId
        });
        if (!parentBasePath) {
            return er("Could not determine parent base path.", { code: "PATH_ERROR" });
        }

        // 3. List all alias files within that directory (to know which indexes to update)
        const aliasIdsResult = (await $i.db.get(parentBasePath)) || [];
        let aliasIdsToDelete = [];
        if (aliasIdsResult?.error && !(aliasIdsResult?.error.code === 'NOT_FOUND' || aliasIdsResult.error.code === 404)) {
            throw aliasIdsResult.error; // Throw real errors
        } else if (Array.isArray(aliasIdsResult.success)) {
            aliasIdsToDelete = aliasIdsResult.success;
        }
        // If directory not found or empty, proceed to delete the (likely non-existent) directory anyway.

        // 4. Delete the entire parent base directory
        const deleteDirResult = await $i.db.delete(parentBasePath);
         if (deleteDirResult.error && !(deleteDirResult.error.code === 'NOT_FOUND' || deleteDirResult.error.code === 404)) {
             throw deleteDirResult.error;
         }
         if (!deleteDirResult.error) {
         } else {
         }

        // 5. Perform Recursive Cleanup (from the directory *containing* the parentBasePath)
        let deletedPaths = (!deleteDirResult.error) ? [parentBasePath] : [];
        const listPath = path.dirname(parentBasePath);
        const cleanupResult = await checkAndDeleteEmptyPathRecursive(listPath, 'atSeries', $i);
         if (!cleanupResult.success) {
             console.error("Error during directory cleanup:", cleanupResult.error);
         }
         deletedPaths = deletedPaths.concat(cleanupResult.deletedPaths);

         // 6. Update Indexes for all affected aliases
         let indexUpdateErrors = [];
         for (const aliasId of aliasIdsToDelete) {
             // Check if alias has other comments in the series *before* removing from index
             const hasMoreComments = await checkAliasHasAnyCommentsInSeries($i, aliasId, heichelId, seriesId);
             if (hasMoreComments.error) {
                 console.error(`Failed check for remaining comments for ${aliasId}, skipping index update.`, hasMoreComments.error);
                 indexUpdateErrors.push({ aliasId, error: "Check failed" });
             } else if (!hasMoreComments.success) {
                 const indexUpdateResult = await removeSeriesFromAliasIndex($i, aliasId, heichelId, seriesId);
                 if (indexUpdateResult.error) {
                     console.error(`Failed index update for ${aliasId}:`, indexUpdateResult.error);
                     indexUpdateErrors.push({ aliasId, error: indexUpdateResult.error });
                 } else {
                     deletedPaths = deletedPaths.concat(indexUpdateResult.deletedPaths || []);
                 }
             } else {
             }
         }


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


// --- Index Update Helper ---

/**
 * @async
 * @function removeSeriesFromAliasIndex
 * @description Removes a seriesId from the alias's index list and cleans up if empty.
 * @returns {Promise<{success: boolean, deletedPaths?: Array<string>, error?: object}>}
 */
async function removeSeriesFromAliasIndex($i, aliasId, heichelId, seriesId) {
    const seriesIndexPath = commentsOfAliasByHeichelAndSeries({ aliasId, heichelId });
    if (!seriesIndexPath) return { success: false, error: er("Could not get series index path") };

    try {
        // Assumes db.removeElementFromArray handles non-existence gracefully
        // and returns { success: { isEmpty: boolean } }
        const removeResult = await $i.db.removeElementFromArray(seriesIndexPath,
            { exact: { selfEquals: seriesId } }, // Schema to find the seriesId string
            { deleteSelfIfEmpty: true } // Tell DB to delete the index file if last element removed
        );

        if (removeResult.error && !(removeResult.error.code === 'NOT_FOUND' || removeResult.error.code === 404)) {
             // Ignore not found, fail on others
             throw removeResult.error;
        }

        let deletedPaths = [];
        if(removeResult.success?.wasDeleted) { // Check if the file itself was deleted by the DB operation
             deletedPaths.push(seriesIndexPath);
             // Clean up parent directories of the index file
             const indexParentPath = path.dirname(seriesIndexPath);
              // Stop cleanup at 'aliases' or 'heichel' level? Choose 'heichel'.
             const cleanupResult = await checkAndDeleteEmptyPathRecursive(indexParentPath, 'heichel', $i);
             if (!cleanupResult.success) console.error("Error cleaning up index parent directory:", cleanupResult.error);
             deletedPaths = deletedPaths.concat(cleanupResult.deletedPaths);
        } else if (!removeResult.error){
        } else {
        }

        return { success: true, deletedPaths };

    } catch (e) {
        console.error(`Error removing series ${seriesId} from index for alias ${aliasId}:`, e);
        return { success: false, error: er("DB error during index update", { details: e }) };
    }
}

/**
 * @async
 * @function checkAliasHasAnyCommentsInSeries
 * @description Checks if an alias has *any* remaining comment files anywhere within a given series/heichel.
 * This is potentially expensive as it might involve listing many directories.
 * @returns {Promise<{success: boolean, error?: object}>} True if comments remain, false otherwise.
 */
async function checkAliasHasAnyCommentsInSeries($i, aliasId, heichelId, seriesId) {
    const seriesBasePath = getPathAtSeries({ heichelId, seriesId });
    if (!seriesBasePath) return { success: false, error: er("Cannot get series base path") };

    try {
        // We need to check both atPost and atComment paths within the series
        const potentialPaths = [
            `${seriesBasePath}/atPost`,
            `${seriesBasePath}/atComment` // This isn't quite right, atComment is nested under atPost/postId
        ];

        // Check atPost directly
        const atPostPath = `${seriesBasePath}/atPost`;
        const postsResult = await $i.db.get(atPostPath);
        if (postsResult.success && Array.isArray(postsResult.success)) {
            for (const postId of postsResult.success) {
                const aliasFilePath = `${atPostPath}/${postId}/${aliasId}`;
                const existsResult = await $i.db.exists(aliasFilePath);
                if (existsResult.success) return { success: true }; // Found one, no need to look further
                 if (existsResult.error && !(existsResult.error.code === 'NOT_FOUND' || existsResult.error.code === 404)) throw existsResult.error; // Real error

                 // Also check for comments on comments within this post
                  const atCommentPath = `${atPostPath}/${postId}/atComment`;
                  const commentsResult = await $i.db.get(atCommentPath);
                  if (commentsResult.success && Array.isArray(commentsResult.success)) {
                      for (const commentParentId of commentsResult.success) {
                           const aliasFilePathComment = `${atCommentPath}/${commentParentId}/${aliasId}`;
                           const existsCommentResult = await $i.db.exists(aliasFilePathComment);
                           if (existsCommentResult.success) return { success: true };
                            if (existsCommentResult.error && !(existsCommentResult.error.code === 'NOT_FOUND' || existsCommentResult.error.code === 404)) throw existsCommentResult.error;
                      }
                  } else if (commentsResult.error && !(commentsResult.error.code === 'NOT_FOUND' || commentsResult.error.code === 404)) {
                       throw commentsResult.error;
                  }
            }
        } else if (postsResult.error && !(postsResult.error.code === 'NOT_FOUND' || postsResult.error.code === 404)) {
             throw postsResult.error; // Real error listing posts
        }


        // If we got here, no comment file was found for the alias in this series
        return { success: false };

    } catch (e) {
        console.error(`Error checking for remaining comments for ${aliasId} in series ${seriesId}:`, e);
        // Fail safe: assume comments *might* still exist if we had an error checking
        return { success: false, error: er("Error checking remaining comments", { details: e.stack }) };
    }
}


module.exports = {
    deleteComment,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent
};
//--- END OF NEW FILE commentDeletion.js ---
