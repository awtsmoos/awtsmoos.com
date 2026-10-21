//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ProfileCommentBrowse
 * @description
 * The Awtsmoos lets every alias reveal its whole comment harvest organized by
 * Heichel -> series -> post, so the public profile can browse and search it all;
 * Awtsmoos.com keeps every doorway paginated and bounded while the Awtsmoos keeps nothing hidden.
 *
 * Ground truth is the heichelos comment tree
 *   <sp>/heichelos/<heichelId>/comments/atSeries/<seriesId>/atPost/<postId>/<aliasId>
 * unioned with the alias-side comment index
 *   <sp>/aliases/<aliasId>/comments/heichel/<heichelId>/series/<seriesId>/atPost
 * so imports that bypass the alias index still appear.
 */

const { commentSeriesByAlias, commentPostsByAlias, commentsByAliasPost } = require('./commentBrowseBrowse.js');
const { searchCommentsByAlias } = require('./commentBrowseSearch.js');

module.exports = {
	commentSeriesByAlias,
	commentPostsByAlias,
	commentsByAliasPost,
	searchCommentsByAlias
};
