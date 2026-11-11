//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicDiscoveryRoutes
 * @description
 * The Awtsmoos lets one river answer both its canonical name and an older doorway;
 * Awtsmoos.com keeps `/feed` authoritative while `/feed/posts` returns the same shore.
 * Public discovery remains read-only, measured, paginated, and compatible.
 * The river itself lives in _awtsmoos.publicDiscoveryFeed.js (batch 23 split).
 */

const { trending } = require('./helper/profile/discovery.js');
const { publicFeedAliasIds, publicPeople } = require('./helper/profile/publicAliases.js');
const { csv, getQuery, ok, paginate } = require('./helper/profile/apiTools.js');
const { rankTrending, TRENDING_CANDIDATES } = require('./helper/profile/trending/TrendingRanker.js');
const { er } = require('./helper/general.js');
const { enrichItemsWithSocialKernel } = require('./helper/socialKernel/SocialKernelProjection.js');
const { feedResponse, latestPage, viewerAlias } = require('./_awtsmoos.publicDiscoveryFeed.js');

function badMethod() {
	return er({ code: 'BAD_METHOD', message: 'Use GET.' });
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

async function trendingResponse($i, userid) {
	const query = getQuery($i);
	const aliases = await discoveryAliases($i, query);
	const viewerAliasId = await viewerAlias($i, userid, query);
	const scopedQuery = { ...query, aliases: aliases.join(',') };
	return trendingPage({ $i, items: await trending({ $i, query: scopedQuery }), query, viewerAliasId });
}

module.exports = ({ $i, userid } = {}) => {
	const feed = async () => $i.request.method === 'GET' ? feedResponse($i, userid) : badMethod();
	return {
		'/people': async () => $i.request.method === 'GET'
			? ok(await publicPeople({ $i, query: getQuery($i) }), { query: getQuery($i), extra: { discovery: 'public-alias-handles' } })
			: badMethod(),
		'/feed': feed,
		'/feed/posts': feed,
		'/trending': async () => $i.request.method === 'GET' ? trendingResponse($i, userid) : badMethod()
	};
};

module.exports.discoveryAliases = discoveryAliases;
module.exports.feedResponse = feedResponse;
module.exports.latestPage = latestPage;
module.exports.trendingPage = trendingPage;
