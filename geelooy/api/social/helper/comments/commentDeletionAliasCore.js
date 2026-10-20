//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionAliasCore
 * @description Deletes the alias comment file, cleans up empty paths and updates the alias index (seam-split from commentDeletionAlias.js).
 */

	const path = require("path");
	const { checkAndDeleteEmptyPathRecursive } = require("./commentDeletionCleanup.js");
	const { removeSeriesFromAliasIndex } = require("./commentDeletionIndexRemove.js");
	const { checkAliasHasAnyCommentsInSeries } = require("./commentDeletionIndexCheck.js");

async function deleteAliasFileAndCleanup({ $i, aliasId, heichelId, seriesId, aliasCommentFilePath }) {
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
		return deletedPaths;
}

module.exports = {
	deleteAliasFileAndCleanup,
};
