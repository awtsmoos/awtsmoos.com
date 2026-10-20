//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionSingleStore
 * @description Writes back the filtered comment array and performs cleanup and index updates for deleteComment (seam-split from commentDeletionSingle.js).
 */

	const path = require("path");
	const { getPathAtSeries, getListOfPostsOrCommentsInSeriesPath } = require("./commentPaths.js");
	const { checkAndDeleteEmptyPathRecursive } = require("./commentDeletionCleanup.js");
	const { removeSeriesFromAliasIndex } = require("./commentDeletionIndexRemove.js");
	const { checkAliasHasAnyCommentsInSeries } = require("./commentDeletionIndexCheck.js");

async function storeCommentDeletion({ $i, aliasId, aliasCommentFilePath, verseSection, updatedCommentsArray, heichelId, seriesId, parentType, postId }) {
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
		return deletedPaths;
}

module.exports = {
	storeCommentDeletion,
};
