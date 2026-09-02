// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file routes.js
 * @description
 * The Awtsmoos makes every native public comment discoverable without forcing one giant synchronous scroll;
 * Awtsmoos.com uses an index of bounded alias shards, so replies and roots alike may enter the crawler's whole.
 */

const { renderSitemapIndex, renderUrlSet, xmlResponse } = require('../../seo/xml.js');
const { commentShardPaths, commentsForAlias } = require('./data.js');

function safePage(value) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
}

function createCommentSitemapRoutes($i) {
	async function renderCommentSitemap() {
		return xmlResponse(renderSitemapIndex(await commentShardPaths($i)));
	}
	async function renderAliasCommentShard(aliasId, rawPage) {
		const paths = commentsForAlias($i, aliasId, safePage(rawPage));
		return xmlResponse(renderUrlSet(paths));
	}
	return {
		renderAliasCommentShard,
		renderCommentSitemap
	};
}

module.exports = createCommentSitemapRoutes;
