//B"H
//Blessed is He
//Boruch Hashem


/**
 * Posts slice of the helper index.
 * Split sibling of index.js (verbatim relocation).
 */

var {
    getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getHeichelosOfPostsOfAlias,
	getSeriesCreatedOfAliasInHeichel,
	getHeichelosOfSeriesCreatedOfAlias,
	getHeichelosOfCommetsOfAlias,
	getSeriesInHeichelOfCommetsOfAlias,
	getPostsOfCommentsInSeriesOfAlias,

    
    addPostToSeries,         // Renamed/Rewritten
    editPostInSeries,        // Renamed/Rewritten
    deletePostFromSeries,    // Renamed/Rewritten
    getPostFromSeries,       // Renamed/Rewritten
    getPostsInSeries,        // Renamed/Rewritten
    getPostsByProperty,      // Renamed/Rewritten
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost

} = require("./post/index.js");

module.exports = {
	addPostToSeries,
	editPostInSeries,
	deletePostFromSeries,
	getPostFromSeries,
	getPostsInSeries,
	getPostsByProperty,
	getSubmittedPosts,
	approveSubmittedPost,
	denySubmittedPost
};
