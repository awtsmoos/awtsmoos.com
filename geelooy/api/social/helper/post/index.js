//B"H
//Blessed is He
//Boruch Hashem
/**
 * B"H
 *
 * Helper functions to manage POSTS within their SERIES.
 * Posts are stored directly within the series data structure:
 * /<sp>/heichelos/<heichelId>/series/<seriesId>/posts/<postId> -> {postData}
 */
const { getPostsOfAliasInSeries } = require("./indexAliasInSeries.js");
const { getSeriesOfPostsOfAliasInHeichel } = require("./indexAliasSeries.js");
const { getHeichelosOfPostsOfAlias } = require("./indexAliasPosts.js");
const { getSeriesCreatedOfAliasInHeichel, getHeichelosOfSeriesCreatedOfAlias, getHeichelosOfCommetsOfAlias, getSeriesInHeichelOfCommetsOfAlias, getPostsOfCommentsInSeriesOfAlias } = require("./indexAliasComments.js");
const { addPostToSeries } = require("./indexAdd.js");
const { editPostInSeries } = require("./indexEdit.js");
const { deletePostFromSeries } = require("./indexDelete.js");
const { getPostFromSeries } = require("./indexRead.js");
const { getPostsInSeries } = require("./indexList.js");
const { getPostsByProperty } = require("./indexByProperty.js");
const { getSubmittedPosts, approveSubmittedPost, denySubmittedPost } = require("./submissions.js");

module.exports = {
	getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getHeichelosOfPostsOfAlias,
	getSeriesCreatedOfAliasInHeichel,
	getHeichelosOfSeriesCreatedOfAlias,
	getHeichelosOfCommetsOfAlias,
	getSeriesInHeichelOfCommetsOfAlias,
	getPostsOfCommentsInSeriesOfAlias,
	

	
    addPostToSeries,
    editPostInSeries,
    deletePostFromSeries,
    getPostFromSeries,
    getPostsInSeries,
    getPostsByProperty,
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost,
    // Removed: getPost, addPostToHeichel, deletePost, editPostDetails, getPostsInHeichel (replaced by Series-centric versions)
    // Removed: detailedPostOperation (replace with specific GET/PUT/DELETE routes)
};
