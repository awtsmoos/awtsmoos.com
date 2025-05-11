//--- START OF NEW FILE commentPaths.js ---

/**
 * B"H
 * Paths are the Kav, structuring the Awtsmoos’s boundless light into form.
 * Refactored for a simpler structure: .../parentID/aliasID -> { verseSection: [comments...] }
 */

const path = require('path'); // Needed for dirname cleanup potentially

const {
    sp
} = require("../_awtsmoos.constants.js");

const {
    er
} = require("../general.js")

// --- Core Path Builders (Mostly Unchanged) ---

/**
 * @method getPathAtSeries
 * @description Base path for all comments within a specific series in a heichel.
 */
function getPathAtSeries({
    heichelId,
    seriesId
}) {
    if (!heichelId || !seriesId) {
        er("getPathAtSeries requires heichelId and seriesId", { heichelId, seriesId });
        return null; // Or throw
    }
    return `${sp}/heichelos/${heichelId}/comments/atSeries/${seriesId}`;
}

/**
 * @method getConditionalPathIfPostOrComment
 * @description Gets the 'atPost' or 'atComment' part of the path.
 */
function getConditionalPathIfPostOrComment({
    link, // "atPost" or "atComment"
    postId // Required only if link is "atComment"
}) {
    if (link === "atPost") {
        return link;
    } else if (link === "atComment") {
        if (!postId) {
            er("getConditionalPathIfPostOrComment requires postId for atComment link");
            return null; // Or throw
        }
        return `atPost/${postId}/atComment`;
    } else {
        er("Invalid link type in getConditionalPathIfPostOrComment", { link });
        return "other"; // Or throw
    }
}

/**
 * @method getListOfPostsOrCommentsInSeriesPath
 * @description Path to the directory holding parent IDs (posts or comments) for a given type within a series.
 */
function getListOfPostsOrCommentsInSeriesPath({
    heichelId,
    seriesId,
    parentType, // Optional: inferred if link provided
    link, // Optional: "atPost" or "atComment"
    postId // Optional: required only if link/parentType is "atComment"
}) {
    if (!link) {
        link = parentType === "post" ? "atPost" : parentType === "comment" ? "atComment" : null;
    }
    if (!link) {
        er("getListOfPostsOrCommentsInSeriesPath requires link or parentType");
        return null;
    }

    const seriesPath = getPathAtSeries({ heichelId, seriesId });
    if (!seriesPath) return null;

    const conditionalPath = getConditionalPathIfPostOrComment({ link, postId });
    if (!conditionalPath) return null;

    return `${seriesPath}/${conditionalPath}`;
}


// --- Paths for the NEW Structure ---

/**
 * @method getParentCommentsBasePath
 * @description Path to the directory containing all alias comment files for a specific parent.
 * Example: .../atSeries/series123/atPost/postABC/
 */
function getParentCommentsBasePath({
    heichelId,
    seriesId,
    parentId,
    parentType, // Optional: inferred if link provided
    link, // Optional: "atPost" or "atComment"
    postId // Optional: required only if link/parentType is "atComment"
}) {
    const listPath = getListOfPostsOrCommentsInSeriesPath({
        heichelId,
        seriesId,
        parentType,
        link,
        postId
    });
    if (!listPath) return null;
    if (!parentId) {
        er("getParentCommentsBasePath requires parentId");
        return null;
    }
    return `${listPath}/${parentId}`;
}

/**
 * @method getAliasCommentFilePath
 * @description Path to the specific file/entry holding an alias's comments for a parent.
 * Example: .../atSeries/series123/atPost/postABC/aliasXYZ.awtsmoosData
 */
function getAliasCommentFilePath({
    heichelId,
    seriesId,
    parentId,
    aliasId,
    parentType, // Optional: inferred if link provided
    link, // Optional: "atPost" or "atComment"
    postId // Optional: required only if link/parentType is "atComment"
}) {
    const parentBasePath = getParentCommentsBasePath({
        heichelId,
        seriesId,
        parentId,
        parentType,
        link,
        postId
    });
    if (!parentBasePath) return null;
    if (!aliasId) {
        er("getAliasCommentFilePath requires aliasId");
        return null;
    }
    // Assuming the DB handles the file extension/storage mechanism
    return `${parentBasePath}/${aliasId}`;
}


// --- Indexing Paths (Potentially still useful) ---

/**
 * @method commentsOfAliasByHeichelAndSeries
 * @description Path for an array storing series IDs where an alias has commented within a specific heichel.
 * Example: /_awtsmoos/aliases/aliasXYZ/comments/heichel/heichelABC/seriesCommented.awtsmoosData
 */
function commentsOfAliasByHeichelAndSeries({
    aliasId,
    heichelId
}) {
    if (!aliasId || !heichelId) {
        er("commentsOfAliasByHeichelAndSeries requires aliasId and heichelId");
        return null;
    }
    return `${sp}/aliases/${aliasId}/comments/heichel/${heichelId}/seriesCommented`;
}


/**
 * @method commentsOfAliasByHeichelAndSeries
 * @description Path for an array storing series IDs where an alias has commented within a specific heichel.
 * Example: /_awtsmoos/aliases/aliasXYZ/comments/heichel/heichelABC/seriesCommented.awtsmoosData
 */
function commentsOfAliasByHeichelAndSeriesAndParent({
    aliasId,
    seriesId,
    heichelId,
    parentType,
    parentId,
    postId
}) {
    if (!aliasId || !heichelId) {
        er("commentsOfAliasByHeichelAndSeries requires aliasId and heichelId");
        return null;
    }
    return `${
        sp
    }/aliases/${
        aliasId
    }/comments/heichel/${
        heichelId
    }/series/${
        seriesId
    }/${
        parentType == "post" ? 
        "atPost" : `atComment/inPost/${
            postId
        }`
    }`;
}


// --- Submission Path (Likely Unchanged) ---

/**
 * @method getSubmittedCommentPath
 * @description Constructs path for a submitted comment (pre-approval).
 * Structure might remain separate.
 * Example: /_awtsmoos/heichelos/h1/comments/submitted/alias1/atSeries/s1/comment/temp123
 */
async function getSubmittedCommentPath({
    parentType = "post",
    heichelId,
    parentId, // This is the parent of the *comment* (post or another comment)
    postId,   // This is the ultimate post ID (same as parentId if parentType is post)
    commentId, // The temporary ID for the submitted comment
    aliasId,
    $i
}) {
    var db = $i.db;

    if (!heichelId || !parentId || !commentId || !aliasId) {
        return er("getSubmittedCommentPath missing required params", { heichelId, parentId, commentId, aliasId });
    }

    // Determine the post ID to fetch seriesId from
    const ultimatePostId = parentType === "post" ? parentId : postId;
    if (!ultimatePostId) {
        return er("Could not determine the ultimate post ID for submission path.", { parentType, parentId, postId });
    }

    // Fetch parentSeriesId from the ultimate post
    var postPath = `${sp}/heichelos/${heichelId}/posts/${ultimatePostId}`;
    let parentSeriesId = null;
    try {
        const post = await db.get(
            postPath,
            { propertyMap: { parentSeriesId: true } }
        );
        if (!post || !post.parentSeriesId) {
            return er("Invalid parent post or missing parentSeriesId for submission path.", { postPath, post });
        }
        parentSeriesId = post.parentSeriesId;
    } catch (e) {
        return er("Error fetching post for submission path", { postPath, error: e });
    }

    // Construct the submission path using the retrieved seriesId
    // Note: Using parentSeriesId in the path, consistent with original logic maybe?
    // Or should it be derived differently? Assuming parentSeriesId is the target series.
    return `${sp}/heichelos/${heichelId}/comments/submitted/${aliasId}/atSeries/${parentSeriesId}/comment/${commentId}`;
}

// --- Deprecated Path Functions (Old Structure) ---
/*
function getShtarPath(...) { // REMOVED - Concept replaced by getAliasCommentFilePath + key
    // ... old logic ...
}
function getAuthorPath(...) { // REMOVED - Concept replaced by getAliasCommentFilePath
    // ... old logic ...
}
function getAliasesCommentsPath(...) { // REMOVED - Concept replaced by getParentCommentsBasePath
    // ... old logic ...
}
function getAllVerseSectionsThatHaveAtLeastOneAuthorPath(...) { // REMOVED - Logic replaced by iterating keys/files
    // ... old logic ...
}
function getAliasesAtVerseSectionPath(...) { // REMOVED - Logic replaced by iterating files/checking keys
    // ... old logic ...
}
function getParentPath(...) { // Equivalent to getParentCommentsBasePath now
    // ... old logic ...
}
*/


module.exports = {
    // Core Paths
    getPathAtSeries,
    getListOfPostsOrCommentsInSeriesPath,
    getParentCommentsBasePath, // New
    getAliasCommentFilePath,   // New

    // Indexing
    commentsOfAliasByHeichelAndSeries,
    commentsOfAliasByHeichelAndSeriesAndParent,

    // Submission
    getSubmittedCommentPath,

    // Utility (may be useful internally in other modules)
    getConditionalPathIfPostOrComment
};
//--- END OF NEW FILE commentPaths.js ---