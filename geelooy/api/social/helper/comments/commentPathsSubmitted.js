//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentPathsSubmitted
 * @description Submitted comment path (split from commentPaths.js, verbatim).
 */

const {
    sp
} = require("../_awtsmoos.constants.js");

const {
    er
} = require("../general.js")

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

module.exports = {
	getSubmittedCommentPath,
};
