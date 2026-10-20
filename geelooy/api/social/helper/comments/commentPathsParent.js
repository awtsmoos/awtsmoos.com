//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentPathsParent
 * @description Parent/alias comment file paths (split from commentPaths.js, verbatim).
 */

const {
    sp
} = require("../_awtsmoos.constants.js");

const {
    er
} = require("../general.js")

	const { getListOfPostsOrCommentsInSeriesPath } = require("./commentPathsCore.js");

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

module.exports = {
	getParentCommentsBasePath,
	getAliasCommentFilePath,
};
