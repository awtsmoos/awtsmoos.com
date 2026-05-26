//--- START OF NEW FILE commentRetrieval.js ---

/**
 * B"H
 * Retrieval unveils the hidden, like the Awtsmoos revealing Ohr Ein Sof to the worlds.
 * Refactored for simpler structure.
 */

const {
    sp // Base path constant
} = require("../_awtsmoos.constants.js");

const {
    er,
    myOpts // Utility for options like pagination, filtering
} = require("../general.js");

const {
    // New path functions
    getAliasCommentFilePath,
    getParentCommentsBasePath
    // Deprecated: getShtarPath, getAuthorPath, getAliasesAtVerseSectionPath
} = require("./commentPaths.js");

// Helper to get verseSection from input or default
function getVerseSectionInput($i, verseSection) {
    if (
        verseSection === undefined || 
        verseSection === null) {
        verseSection = $i.$_GET?.verseSection; // Check GET params
    }
    // Allow 0 as a valid verseSection, default to "root" otherwise
    return (verseSection !== undefined && verseSection !== null) ? verseSection : "root";
}

/**
 * @method getCommentsByAliasAtVerseSection
 * @description Retrieves the array of comments made by a specific alias on a specific verse section of a parent.
 * @returns {Object} { success: [commentsArray] } or error object.
 */
async function getCommentsByAliasAtVerseSection({
    $i,
    aliasId,
    parentType = "post",
    parentId,
    heichelId,
    postId, // Required if parentType is "comment"
    seriesId,
    verseSection // Optional, defaults to "root"
}) {
    const opts = myOpts($i); // For pagination/filtering within the array if needed later

    // Input Validation
    if (!aliasId) aliasId = $i.$_GET?.aliasId;
    if (!parentId) parentId = $i.$_GET?.parentId;
    if (!heichelId) heichelId = $i.$_GET?.heichelId;
    if (!seriesId) seriesId = $i.$_GET?.seriesId;
    if (!parentType) parentType = $i.$_GET?.parentType || "post";
     if (parentType === "comment" && !postId) postId = $i.$_GET?.postId;


    if (!aliasId || !parentId || !heichelId || !seriesId) {
        return er("Missing required parameters", { aliasId, parentId, heichelId, seriesId });
    }
     if (parentType === "comment" && !postId) {
        return er("postId is required when parentType is 'comment'");
    }
  
    
    verseSection = getVerseSectionInput($i, verseSection);

    // Get the path to the alias's comment file
    const aliasCommentFilePath = getAliasCommentFilePath({
        heichelId, seriesId, parentId, aliasId, parentType, postId
    });
    if (!aliasCommentFilePath) {
        return er("Could not determine comment file path.", { code: "PATH_ERROR" });
    }

    try {
        // Retrieve the array stored under the verseSection key
        const commentsArray = await $i.db.getObjectKey(aliasCommentFilePath, verseSection);

        if (Array.isArray(commentsArray)) {
            
            return { success: commentsArray };
        } else {
            // Key might exist but not be an array, or not exist at all. Treat as no comments found.
            return { success: [] }; // Return empty array for consistency
        }
    } catch (e) {
        // Handle case where the alias file itself doesn't exist (vs. key not existing)
        if (e.code === 'NOT_FOUND' || e.code === 404) { // Adjust based on actual DB error codes
             return { success: [] }; // No comments if file doesn't exist
        }
        console.error(`Error retrieving comments from ${aliasCommentFilePath} key ${verseSection}:`, e);
        return er("Database error retrieving comments.", { code: "DB_READ_ERROR", details: e, path: aliasCommentFilePath, key: verseSection });
    }
}

/**
 * @method getVerseSectionsCommentedByAuthorInParent
 * @description Retrieves a list of verse sections where a specific alias has commented on a specific parent.
 * @returns {Object} { success: [verseSectionKeysArray] } or error object.
 */
async function getVerseSectionsCommentedByAuthorInParent({
    $i,
    aliasId,
    parentType = "post",
    parentId,
    heichelId,
    postId, // Required if parentType is "comment"
    seriesId
}) {
    // Input Validation (similar to getCommentsByAliasAtVerseSection)
     if (!aliasId) aliasId = $i.$_GET?.aliasId;
     if (!parentId) parentId = $i.$_GET?.parentId;
     if (!heichelId) heichelId = $i.$_GET?.heichelId;
     if (!seriesId) seriesId = $i.$_GET?.seriesId;
     if (!parentType) parentType = $i.$_GET?.parentType || "post";
      if (parentType === "comment" && !postId) postId = $i.$_GET?.postId;


     if (!aliasId || !parentId || !heichelId || !seriesId) {
         return er("Missing required parameters", { aliasId, parentId, heichelId, seriesId });
     }
      if (parentType === "comment" && !postId) {
         return er("postId is required when parentType is 'comment'");
     }

    // Get the path to the alias's comment file
    const aliasCommentFilePath = getAliasCommentFilePath({
        heichelId, seriesId, parentId, aliasId, parentType, postId
    });
    if (!aliasCommentFilePath) {
        return er("Could not determine comment file path.", { code: "PATH_ERROR" });
    }

    try {
        // Retrieve all keys (verse sections) from the alias's comment file/object
        const verseSectionKeys = await $i.db.getObjectKeys(aliasCommentFilePath);

        if (Array.isArray(verseSectionKeys)) {
            return { success: verseSectionKeys };
        } else {
            // Should return empty array if file exists but has no keys
            return { success: [], failed: verseSectionKeys };
        }
    } catch (e) {
         if (e.code === 'NOT_FOUND' || e.code === 404) {
             return { success: [] }; // No verse sections if file doesn't exist
         }
        console.error(`Error retrieving verse sections from ${aliasCommentFilePath}:`, e);
        return er("Database error retrieving verse sections.", { code: "DB_READ_ERROR", details: e, path: aliasCommentFilePath });
    }
}

/**
 * @method getAuthorsCommentingAtVerseSectionInParent
 * @description Retrieves a list of alias IDs that have commented on a specific verse section of a specific parent.
 * @returns {Object} { success: [aliasIdArray] } or error object.
 */
async function getAuthorsCommentingAtVerseSectionInParent({
    $i,
    parentType = "post",
    parentId,
    heichelId,
    postId, // Required if parentType is "comment"
    seriesId,
    verseSection // Optional, defaults to "root"
}) {
    // Input Validation
    if (!parentId) parentId = $i.$_GET?.parentId;
    if (!heichelId) heichelId = $i.$_GET?.heichelId;
    if (!seriesId) seriesId = $i.$_GET?.seriesId;
    if (!parentType) parentType = $i.$_GET?.parentType || "post";
    if (parentType === "comment" && !postId) postId = $i.$_GET?.postId;


    if (!parentId || !heichelId || !seriesId) {
        return er("Missing required parameters", { parentId, heichelId, seriesId });
    }
     if (parentType === "comment" && !postId) {
        return er("postId is required when parentType is 'comment'");
    }

    verseSection = getVerseSectionInput($i, verseSection);

    // Get the base path containing all alias files for this parent
    const parentBasePath = getParentCommentsBasePath({
        heichelId, seriesId, parentId, parentType, postId
    });
    if (!parentBasePath) {
        return er("Could not determine parent base path.", { code: "PATH_ERROR" });
    }

    try {
        // 1. List all alias files/entries in the parent directory
        const allAliasIds = await $i.db.get(parentBasePath); // Returns array of alias IDs (filenames)

        if (!Array.isArray(allAliasIds) || allAliasIds.length === 0) {
            return { success: [] };
        }

        // 2. Filter aliases: Check if each alias has the specified verseSection key
        const authorsAtVerseSection = [];
        for (const aliasId of allAliasIds) {
            const aliasCommentFilePath = `${parentBasePath}/${aliasId}`; // Construct path
            try {
                // Check if the key exists (more efficient than getting the value if large)
                const hasKey = await $i.db.hasObjectKey(aliasCommentFilePath, verseSection); // Assumes this DB method exists
                // Fallback: Get value and check if it's a non-empty array
                // const value = await $i.db.getObjectKey(aliasCommentFilePath, verseSection);
                // const hasKey = Array.isArray(value) && value.length > 0;
                
                
                if (hasKey) {
                    authorsAtVerseSection.push(aliasId);
                }
            } catch (checkError) {
                 if (checkError.code === 'NOT_FOUND' || checkError.code === 404) {
                    // File might have been deleted between list and check, ignore.
                    console.warn(`File ${aliasCommentFilePath} listed but not found during key check.`);
                 } else {
                    // Log other errors but continue checking other aliases
                    console.error(`Error checking key ${verseSection} in ${aliasCommentFilePath}:`, checkError);
                 }
            }
        }

        return { success: authorsAtVerseSection };

    } catch (e) {
         if (e.code === 'NOT_FOUND' || e.code === 404) {
             return { success: [] }; // No authors if parent dir doesn't exist
         }
        console.error(`Error listing or checking aliases in ${parentBasePath}:`, e);
        return er("Database error retrieving authors.", { code: "DB_READ_ERROR", details: e, path: parentBasePath });
    }
}


/**
 * @method getComment
 * @description Retrieves a specific comment by its ID, requiring context (parent, author, verse).
 * @returns {Object} Comment data object or null/error.
 */
async function getComment(
    {
        $i,
        commentId, // The specific ID of the comment to find
        // Context needed to locate the comment's array:
        aliasId,
        parentType,
        parentId,
        heichelId,
        postId,
        seriesId,
        verseSection
    }
) {
    // Input Validation
     if (!commentId) commentId = $i.$_GET?.commentId;
     if (!aliasId) aliasId = $i.$_GET?.aliasId;
     if (!parentId) parentId = $i.$_GET?.parentId;
     if (!heichelId) heichelId = $i.$_GET?.heichelId;
     if (!seriesId) seriesId = $i.$_GET?.seriesId;
     if (!parentType) parentType = $i.$_GET?.parentType || "post";
      if (parentType === "comment" && !postId) postId = $i.$_GET?.postId;


     if (!commentId || !aliasId || !parentId || !heichelId || !seriesId) {
         return er("Missing required parameters for getComment", { commentId, aliasId, parentId, heichelId, seriesId });
     }
      if (parentType === "comment" && !postId) {
         return er("postId is required when parentType is 'comment'");
     }

    verseSection = getVerseSectionInput($i, verseSection);

    try {
        // 1. Get the array where the comment *should* be
        const commentsResult = await getCommentsByAliasAtVerseSection({
            $i, aliasId, parentType, parentId, heichelId, postId, seriesId, verseSection
        });

        if (commentsResult.error || !Array.isArray(commentsResult.success)) {
            return null; // Or return commentsResult.error if it exists
        }

        const commentsArray = commentsResult.success;

        // 2. Find the comment within the array
        const foundComment = commentsArray.find(comment => comment && comment.id === commentId);

        if (foundComment) {
            return foundComment; // Return the comment object directly
        } else {
            return null; // Comment ID not found in the expected array
        }

    } catch (e) {
        console.error(`Error in getComment for ID ${commentId}:`, e);
        return er("Internal server error retrieving comment.", { details: e.stack }); // Return error object
    }
}


module.exports = {
    getCommentsByAliasAtVerseSection,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    getComment
};
//--- END OF NEW FILE commentRetrieval.js ---
