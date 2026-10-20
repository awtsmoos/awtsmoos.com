//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionParentCore
 * @description Verifies authority, deletes all comments of a parent and updates alias indexes (seam-split from commentDeletionParent.js).
 */

	const path = require("path");
	const { er } = require("../general.js");
	const { verifyHeichelAuthority } = require("../heichel.js");
	const { getParentCommentsBasePath } = require("./commentPaths.js");
	const { checkAndDeleteEmptyPathRecursive } = require("./commentDeletionCleanup.js");
	const { removeSeriesFromAliasIndex } = require("./commentDeletionIndexRemove.js");
	const { checkAliasHasAnyCommentsInSeries } = require("./commentDeletionIndexCheck.js");

async function deleteParentCommentsCore({ $i, aliasId, heichelId, userid, parentId, parentType, postId, seriesId }) {
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
		return { deletedPaths, indexUpdateErrors };
}

module.exports = {
	deleteParentCommentsCore,
};
