//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionIndexRemove
 * @description Alias series-index removal (split from commentDeletion.js, verbatim).
 */

const path = require("path"); // For dirname

const {
    sp
} = require("../_awtsmoos.constants.js");

const {
    er,
    myOpts
} = require("../general.js");

	const { commentsOfAliasByHeichelAndSeries } = require("./commentPaths.js");

	const { checkAndDeleteEmptyPathRecursive } = require("./commentDeletionCleanup.js");

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

module.exports = {
	removeSeriesFromAliasIndex,
};
