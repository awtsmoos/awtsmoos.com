//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicDiscoveryRoutes
 * @description
 * The Awtsmoos lets one river answer both its canonical name and an older doorway;
 * Awtsmoos.com keeps `/feed` authoritative while `/feed/posts` returns the same shore.
 * Public discovery remains read-only, measured, paginated, and compatible.
 */

const { profileFeed, readLastGoodRiver, trending } = require('./helper/profile/discovery.js');
const { publicFeedAliasIds, publicPeople } = require('./helper/profile/publicAliases.js');
const { csv, getQuery, ok, paginate } = require('./helper/profile/apiTools.js');
const { paginateChronological } = require('./helper/profile/pagination/ChronologicalPagination.js');
const { rankTrending, TRENDING_CANDIDATES } = require('./helper/profile/trending/TrendingRanker.js');
const { er } = require('./helper/general.js');
const { enrichItemsWithSocialKernel } = require('./helper/socialKernel/SocialKernelProjection.js');
const { enrichItemsWithSocialSummary } = require('./helper/socialSummary/SocialSummaryBatch.js');
const { verifiedViewerAlias } = require('./helper/socialSummary/SocialSummaryViewer.js');
const { buildAffinity, seriesFamily } = require('./helper/platform/feedRoutesAffinity.js');

function badMethod() {
	return er({ code: 'BAD_METHOD', message: 'Use GET.' });
}

async function viewerAlias($i, userid, query) {
	return verifiedViewerAlias({ $i, userid, requestedAliasId: query.viewerAliasId || '' });
}

function affinityFor(userid) {
	if (!userid) return null;
	try {
		const affinity = buildAffinity(userid);
		if (!affinity || (!affinity.seriesWeight.size && !affinity.familyWeight.size)) return null;
		return affinity;
	} catch (_) {
		return null;
	}
}

function rankPageByAffinity(pageItems, affinity) {
	if (!affinity) return pageItems;
	const scored = pageItems.map((item, index) => {
		const sid = String(item?.source?.seriesId || '');
		const sw = affinity.seriesWeight.get(sid) || 0;
		const fam = sid ? seriesFamily(sid) : null;
		const fw = (!sw && fam) ? (affinity.familyWeight.get(fam) || 0) * 0.55 : 0;
		let score = 1 + sw + fw;
		const postId = String(item?.source?.postId || item?.id || '');
		if (postId && affinity.readPostIds.has(postId)) score *= 0.35;
		return { item, index, score };
	});
	scored.sort((a, b) => (b.score - a.score) || (a.index - b.index));
	return scored.map(entry => entry.item);
}

async function latestPage({ $i, items, query, viewerAliasId, affinity }) {
	const page = paginateChronological(items, query, { limit: 25, max: 100 });
	const pageItems = rankPageByAffinity(page.items, affinity);
	const summarized = await enrichItemsWithSocialSummary({ $i, items: pageItems, viewerAliasId });
	const enriched = await enrichItemsWithSocialKernel({ $i, items: summarized, viewerAliasId });
	const extra = { socialKernel: 'projection-v1', pagination: 'chronological-cursor-v2' };
	if (affinity) extra.ranking = 'affinity-page-v1';
	return ok(enriched, {
		query,
		pageInfo: page.pageInfo,
		extra
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

function feedItemKey(item) {
	return `${item?.kind || 'post'}:${item?.id || item?.source?.id || item?.source?.postId || ''}`;
}

/**
 * Merges two activity streams into one newest-first stream, keeping the
 * first occurrence of each item. Discover is a site-wide surface: a
 * viewer-scoped request (the viewer's own circle) must still surface
 * the site's newest public activity, or it silently freezes on
 * whatever the viewer's circle last did.
 */
function mergeFeedItems(primary, secondary, cap) {
	const seen = new Set();
	const merged = [];
	for (const item of [...primary, ...secondary]) {
		const key = feedItemKey(item);
		if (key.endsWith(':') || seen.has(key)) continue;
		seen.add(key);
		merged.push(item);
	}
	merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	return merged.slice(0, cap);
}

async function feedResponse($i, userid) {
	const query = getQuery($i);
	const explicit = csv(query.aliases);
	const aliases = explicit.length ? explicit : await publicFeedAliasIds({ $i, query });
	const viewerAliasId = await viewerAlias($i, userid, query);
	let items = await profileFeed({ $i, aliases, query });
	if (explicit.length) {
		// Viewer-scoped discovery: fold in the newest public activity so
		// the surface reads the same live stream the public feed reads,
		// not only the viewer's follow circle.
		const publicAliases = await publicFeedAliasIds({ $i, query });
		const extra = publicAliases.filter(aliasId => !aliases.includes(aliasId));
		if (extra.length) {
			const publicItems = await profileFeed({ $i, aliases: extra, query });
			const cap = Math.max(50, Number(query.limit || 25) * 4);
			items = mergeFeedItems(items, publicItems, cap);
		}
	}
	if (!items.length) {
		// A silent window: this hour's rotating alias block carries no
		// readable activity (most aliases are imported shells). The
		// discovery surface must not go dark for an hour — serve the
		// last good river any window built (batch 21).
		const lastGood = readLastGoodRiver($i);
		if (lastGood) items = lastGood.items;
	}
	return latestPage({ $i, items, query, viewerAliasId, affinity: affinityFor(userid) });
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
