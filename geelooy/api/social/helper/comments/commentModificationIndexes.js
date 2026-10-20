//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModificationIndexes
 * @description Comment index update stubs (split from commentModification.js, verbatim).
 */

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
	updateAllCommentIndexes,
	updateCommentIndexesAtParent,
};
