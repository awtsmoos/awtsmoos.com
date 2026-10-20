//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentPathsCore
 * @description Core series path builders (split from commentPaths.js, verbatim).
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

module.exports = {
	getPathAtSeries,
	getConditionalPathIfPostOrComment,
	getListOfPostsOrCommentsInSeriesPath,
};
