// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PublicDiscoveryRoutes
 * @description The Awtsmoos lets one public response carry content, measured consequence, capabilities, actions, and deep links;
 * Awtsmoos.com enriches only visible latest rows, bounds trending measurement, and keeps old response fields for migration light.
 */
const { profileFeed, trending } = require('./helper/profile/discovery.js');
const { publicFeedAliasIds, publicPeople } = require('./helper/profile/publicAliases.js');
const { csv, getQuery, ok, paginate } = require('./helper/profile/apiTools.js');
const { paginateChronological } = require('./helper/profile/pagination/ChronologicalPagination.js');
const { rankTrending, TRENDING_CANDIDATES } = require('./helper/profile/trending/TrendingRanker.js');
const { er } = require('./helper/general.js');
const { enrichItemsWithSocialKernel } = require('./helper/socialKernel/SocialKernelProjection.js');
const { enrichItemsWithSocialSummary } = require('./helper/socialSummary/SocialSummaryBatch.js');
const { verifiedViewerAlias } = require('./helper/socialSummary/SocialSummaryViewer.js');

function badMethod() {
	return er({ code: 'BAD_METHOD', message: 'Use GET.' });
}

async function viewerAlias($i, userid, query) {
	return verifiedViewerAlias({ $i, userid, requestedAliasId: query.viewerAliasId || '' });
}

async function latestPage({ $i, items, query, viewerAliasId }) {
	const page = paginateChronological(items, query, { limit: 25, max: 100 });
	const summarized = await enrichItemsWithSocialSummary({ $i, items: page.items, viewerAliasId });
	const enriched = await enrichItemsWithSocialKernel({ $i, items: summarized, viewerAliasId });
	return ok(enriched, {
		query,
		pageInfo: page.pageInfo,
		extra: { socialKernel: 'projection-v1', pagination: 'chronological-cursor-v2' }
	});
}

async function trendingPage({ $i, items, query, viewerAliasId }) {
	const ranked = await rankTrending({ $i, items, viewerAliasId });
	const page = paginate(ranked, query, { limit: 25, max: 100 });
	const enriched = await enrichItemsWithSocialKernel({ $i, items: page.items, viewerAliasId });
	return ok(enriched, {
		query,
		pageInfo: page.pageInfo,
		extra: { socialKernel: 'projection-v1', ranking: 'dynamic-measured-v1', candidates: TRENDING_CANDIDATES }
	});
}

async function discoveryAliases($i, query) {
	const explicit = csv(query.aliases);
	return explicit.length ? explicit : publicFeedAliasIds({ $i, query });
}

async function feedResponse($i, userid) {
	const query = getQuery($i);
	const aliases = await discoveryAliases($i, query);
	const viewerAliasId = await viewerAlias($i, userid, query);
	return latestPage({ $i, items: await profileFeed({ $i, aliases, query }), query, viewerAliasId });
}

async function trendingResponse($i, userid) {
	const query = getQuery($i);
	const aliases = await discoveryAliases($i, query);
	const viewerAliasId = await viewerAlias($i, userid, query);
	const scopedQuery = { ...query, aliases: aliases.join(',') };
	return trendingPage({ $i, items: await trending({ $i, query: scopedQuery }), query, viewerAliasId });
}

module.exports = ({ $i, userid } = {}) => ({
	'/people': async () => $i.request.method === 'GET'
		? ok(await publicPeople({ $i, query: getQuery($i) }), { query: getQuery($i), extra: { discovery: 'public-alias-handles' } })
		: badMethod(),
	'/feed': async () => $i.request.method === 'GET' ? feedResponse($i, userid) : badMethod(),
	'/trending': async () => $i.request.method === 'GET' ? trendingResponse($i, userid) : badMethod()
});

module.exports.discoveryAliases = discoveryAliases;
module.exports.latestPage = latestPage;
module.exports.trendingPage = trendingPage;
