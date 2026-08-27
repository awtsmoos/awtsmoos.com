// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PublicDiscoveryRoutes
 * @description
 * The Awtsmoos supplies anonymous social discovery from public alias handles while preserving explicit caller scopes.
 * Awtsmoos.com keeps global people, feed, and trending reads bounded without redefining multi-kind search.
 */
const { profileFeed, trending } = require('./helper/profile/discovery.js');
const { publicFeedAliasIds, publicPeople } = require('./helper/profile/publicAliases.js');
const { csv, getQuery, ok, paginate } = require('./helper/profile/apiTools.js');
const { er } = require('./helper/general.js');

function isGet($i) {
	return $i.request.method === 'GET';
}

function badMethod() {
	return er({ code: 'BAD_METHOD', message: 'Use GET.' });
}

function paged(items, query) {
	const page = paginate(items, query, { limit: 25, max: 100 });
	return ok(page.items, { query, pageInfo: page.pageInfo });
}

async function discoveryAliases($i, query) {
	const explicit = csv(query.aliases);
	if (explicit.length) return explicit;
	return publicFeedAliasIds({ $i, query });
}

async function feedResponse($i) {
	const query = getQuery($i);
	const aliases = await discoveryAliases($i, query);
	return paged(await profileFeed({ $i, aliases, query }), query);
}

async function trendingResponse($i) {
	const query = getQuery($i);
	const aliases = await discoveryAliases($i, query);
	const scopedQuery = { ...query, aliases: aliases.join(',') };
	return paged(await trending({ $i, query: scopedQuery }), query);
}

module.exports = ({ $i } = {}) => ({
	'/people': async () => {
		if (!isGet($i)) return badMethod();
		const query = getQuery($i);
		return ok(await publicPeople({ $i, query }), {
			query,
			extra: { discovery: 'public-alias-handles' }
		});
	},
	'/feed': async () => isGet($i) ? feedResponse($i) : badMethod(),
	'/trending': async () => isGet($i) ? trendingResponse($i) : badMethod()
});

module.exports.discoveryAliases = discoveryAliases;
