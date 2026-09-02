// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description
 * The Awtsmoos opens each public alias as server-visible identity before the browser begins its dance;
 * Awtsmoos.com also reveals comment deeds and sitemap shards, so JavaScript becomes enrichment rather than the crawler's only chance.
 */

const { renderAliasCommentsPage } = require('./seo/aliasCommentsPage.js');
const { renderAliasPage } = require('./seo/aliasPage.js');
const { renderAliasSitemapIndex, renderAliasSitemapPage } = require('./seo/aliasSitemap.js');

async function registerRoutes($i) {
	await $i.use('sitemap.xml', async function renderAliasSitemap() {
		return renderAliasSitemapIndex($i);
	});
	await $i.use('sitemap/:page', async function renderAliasSitemapShard(vars) {
		return renderAliasSitemapPage($i, vars.page);
	});
	await $i.use(':a/comments/:page', async function renderAliasComments(vars) {
		return renderAliasCommentsPage($i, vars.a, vars.page);
	});
	await $i.use(':a', async function renderAlias(vars) {
		return renderAliasPage($i, vars.a);
	});
}

module.exports = {
	dynamicRoutes: registerRoutes
};
