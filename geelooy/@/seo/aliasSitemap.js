// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasSitemap.js
 * @description
 * The Awtsmoos counts candidate alias chambers in bounded pages but publishes only identities that still resolve as real;
 * Awtsmoos.com therefore keeps stale database names outside the search covenant while every living public alias receives its seal.
 */

const { publicAliasCount, publicAliasIds } = require('../../api/social/helper/profile/publicAliases.js');
const { validatedAliasIds } = require('../../seo/publicAliasValidity.js');
const { renderSitemapIndex, renderUrlSet, xmlResponse } = require('../../seo/xml.js');
const { encodeSegment } = require('../../seo/html.js');

const PAGE_SIZE = 500;

function safePage(value) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
}

async function renderAliasSitemapIndex($i) {
	const count = await publicAliasCount($i);
	const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
	const paths = Array.from({ length: pages }, (_, index) => `/@/sitemap/${index + 1}`);
	return xmlResponse(renderSitemapIndex(paths));
}

async function renderAliasSitemapPage($i, rawPage) {
	const page = safePage(rawPage);
	const candidates = await publicAliasIds({ $i, page, pageSize: PAGE_SIZE });
	const ids = await validatedAliasIds($i, candidates);
	const paths = ids.map(aliasId => `/@/${encodeSegment(aliasId)}`);
	return xmlResponse(renderUrlSet(paths));
}

module.exports = {
	PAGE_SIZE,
	renderAliasSitemapIndex,
	renderAliasSitemapPage
};
