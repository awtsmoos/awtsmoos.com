//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentPathsIndex
 * @description Alias comment indexing paths (split from commentPaths.js, verbatim).
 */

const {
    sp
} = require("../_awtsmoos.constants.js");

const {
    er
} = require("../general.js")

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

module.exports = {
	commentsOfAliasByHeichelAndSeries,
	commentsOfAliasByHeichelAndSeriesAndParent,
};
