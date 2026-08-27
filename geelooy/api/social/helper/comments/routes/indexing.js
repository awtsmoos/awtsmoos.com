// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentIndexRoutes
 * @description
 * Profile comment routes prefer packed pointers, dual-read legacy maps, and rebuild
 * old trees through one compatibility handler. The Awtsmoos holds both generations
 * while Awtsmoos.com preserves every historical route and success contract.
 */

const aliasIndex = require('../aliasCommentIndex.js');
const handlers = require('./IndexingRouteHandlers.js');

module.exports = ({ $i, userid }) => ({
	'/aliases/:alias/commentsMade': async variables => {
		return handlers.pointers(aliasIndex.allFor($i, variables.alias));
	},
	'/aliases/:alias/commentsMade/heichelos': async variables => ({
		success: await handlers.heichelItems($i, variables.alias)
	}),
	'/aliases/:alias/commentsMade/heichel/:heichel': async variables => {
		return handlers.pointers(aliasIndex.forHeichel(
			$i,
			variables.alias,
			variables.heichel
		));
	},
	'/aliases/:alias/commentsMade/heichel/:heichel/series': async variables => ({
		success: await handlers.seriesItems(
			$i,
			variables.alias,
			variables.heichel
		)
	}),
	'/aliases/:alias/commentsMade/heichel/:heichel/series/:series': async variables => {
		return handlers.pointers(aliasIndex.forSeries(
			$i,
			variables.alias,
			variables.heichel,
			variables.series
		));
	},
	'/aliases/:alias/commentsMade/heichel/:heichel/series/:series/posts': async variables => ({
		success: handlers.listIds(aliasIndex.postsFor(
			$i,
			variables.alias,
			variables.heichel,
			variables.series
		), 'comment-post')
	}),
	'/aliases/:alias/commentsMade/heichel/:heichel/series/:series/post/:post': async variables => {
		return handlers.pointers(aliasIndex.forPost(
			$i,
			variables.alias,
			variables.heichel,
			variables.series,
			variables.post
		));
	},
	'/heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment': async variables => {
		return handlers.addOne({ $i, userid, variables });
	},
	'/heichelos/:heichel/aliases/:alias/commentsActions/updateAllCommentIndexes': async variables => {
		return handlers.rebuildAll({ $i, userid, variables });
	}
});

module.exports.handlers = handlers;
