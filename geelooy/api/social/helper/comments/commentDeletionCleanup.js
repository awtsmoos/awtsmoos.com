//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionCleanup
 * @description Empty-path recursive cleanup (split from commentDeletion.js, verbatim).
 */

const path = require("path"); // For dirname

const {
    er,
    myOpts
} = require("../general.js");

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

module.exports = {
	checkAndDeleteEmptyPathRecursive,
};
