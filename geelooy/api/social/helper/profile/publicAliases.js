// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PublicAliases
 * @description
 * The Awtsmoos reveals only public alias identity while bounded enrichment lets Awtsmoos.com search names and descriptions
 * without recursive owner-bearing reads or an unbounded fan-out across the public namespace.
 */
const { getAlias } = require('../alias.js');
const { number } = require('./apiTools.js');
const { fairFeedWindow, utcHourBucket } = require('./feedFairness.js');
const { mapInBatches, rankPublicAliasCards } = require('./publicAliasRanking.js');
const { cleanText } = require('./sanitize.js');

const PUBLIC_ALIAS_ROOT = '/social/aliases';
const MAX_PEOPLE_LIMIT = 24;
const MAX_SEARCH_SCAN = 500;
const MAX_FEED_ALIASES = 50;
const ENRICH_BATCH_SIZE = 20;

async function publicAliasCount($i) {
	const result = await $i.db.count(PUBLIC_ALIAS_ROOT);
	return Math.max(0, Number(result?.success) || 0);
}

async function publicAliasIds({ $i, page = 1, pageSize = 12, sortBy = 'alphabetical', order = 'asc' }) {
	const ids = await $i.db.get(PUBLIC_ALIAS_ROOT, {
		recursive: false,
		page: number(page, 1, 1, 100000),
		pageSize: number(pageSize, 12, 1, MAX_SEARCH_SCAN),
		sortBy: ['alphabetical', 'createdBy', 'modifiedBy'].includes(sortBy) ? sortBy : 'alphabetical',
		order: order === 'desc' ? 'desc' : 'asc'
	});
	return Array.isArray(ids) ? ids.map(String).map(id => id.trim()).filter(Boolean) : [];
}

async function publicAliasCard($i, aliasId) {
	const alias = await getAlias(aliasId, $i);
	if (!alias || alias.error) return null;
	return {
		id: aliasId,
		name: cleanText(alias.name || aliasId, 80),
		description: cleanText(alias.description, 300)
	};
}

async function enrichCards($i, ids) {
	const cards = await mapInBatches(ids, ENRICH_BATCH_SIZE, aliasId => publicAliasCard($i, aliasId));
	return cards.filter(Boolean);
}

function pageInfo(page, limit, total) {
	return { page, limit, total, hasPrevious: page > 1, hasNext: page * limit < total };
}

async function browsePeople($i, page, limit, totalAliases) {
	const ids = await publicAliasIds({ $i, page, pageSize: limit });
	return {
		items: await enrichCards($i, ids),
		pageInfo: pageInfo(page, limit, totalAliases),
		coverage: { mode: 'browse', scanned: ids.length, totalAliases, capped: false }
	};
}

async function searchPeople($i, query, page, limit, totalAliases) {
	const scanSize = Math.min(MAX_SEARCH_SCAN, Math.max(totalAliases, 1));
	const scanned = await publicAliasIds({ $i, page: 1, pageSize: scanSize });
	const ranked = rankPublicAliasCards(await enrichCards($i, scanned), query);
	const start = (page - 1) * limit;
	return {
		items: ranked.slice(start, start + limit),
		pageInfo: pageInfo(page, limit, ranked.length),
		coverage: {
			mode: 'public-card-search', scanned: scanned.length, totalAliases,
			capped: totalAliases > scanned.length, scanLimit: MAX_SEARCH_SCAN
		}
	};
}

async function publicPeople({ $i, query = {} }) {
	const page = number(query.page, 1, 1, 100000);
	const limit = number(query.limit, 12, 1, MAX_PEOPLE_LIMIT);
	const q = cleanText(query.q, 80).toLowerCase().trim();
	const totalAliases = await publicAliasCount($i);
	return q ? searchPeople($i, q, page, limit, totalAliases) : browsePeople($i, page, limit, totalAliases);
}

async function publicFeedAliasIds({ $i, query = {}, now = Date.now() }) {
	const rawPage = query.aliasPage;
	const explicit = rawPage !== undefined && rawPage !== null && String(rawPage).trim() !== '';
	const requestedPage = explicit ? number(rawPage, 1, 1, 100000) : null;
	const totalAliases = explicit ? 0 : await publicAliasCount($i);
	return fairFeedWindow({
		totalAliases,
		pageSize: MAX_FEED_ALIASES,
		requestedPage,
		bucket: utcHourBucket(now),
		loadPage: (page, pageSize) => publicAliasIds({ $i, page, pageSize })
	});
}

module.exports = {
	ENRICH_BATCH_SIZE, MAX_FEED_ALIASES, MAX_PEOPLE_LIMIT, MAX_SEARCH_SCAN, PUBLIC_ALIAS_ROOT,
	publicAliasCount, publicAliasIds, publicAliasCard, publicFeedAliasIds, publicPeople
};
