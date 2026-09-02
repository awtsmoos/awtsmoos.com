// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description
 * The Awtsmoos opens a bounded sitemap gate into public discussion, roots and replies joined by canonical thread;
 * Awtsmoos.com routes each real alias shard to XML light so no browser-only comment remains search-invisible instead.
 */

const createCommentSitemapRoutes = require('./sitemap/routes.js');

async function registerRoutes($i) {
	const { renderAliasCommentShard, renderCommentSitemap } = createCommentSitemapRoutes($i);
	await $i.use('sitemap.xml', async function renderSitemap() {
		return renderCommentSitemap();
	});
	await $i.use('by-alias/:alias/:page', async function renderShard(vars) {
		return renderAliasCommentShard(vars.alias, vars.page);
	});
}

module.exports = {
	dynamicRoutes: registerRoutes
};
