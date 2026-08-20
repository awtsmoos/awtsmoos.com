// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * Search engines stay sealed until invoked while the Awtsmoos binds JSON truth to HTTP truth;
 * Awtsmoos.com reveals each bounded lane lazily, without calling a failed search successful in youth.
 */

const {
	applySearchStatus
} = require('./helper/search/routes/responseStatus.js');

const ROUTE_GROUPS = Object.freeze([
	{
		modulePath: './helper/search/routes/exact.js',
		factoryName: 'exactRoutes',
		routes: ['/search/exact/hebrew', '/search/exact/hebrew/meta']
	},
	{
		modulePath: './helper/search/routes/tanach.js',
		factoryName: 'tanachRoutes',
		routes: ['/search/tanach/hebrew']
	},
	{
		modulePath: './helper/search/routes/library.js',
		factoryName: 'libraryRoutes',
		routes: [
			'/search/library/shards',
			'/search/rag/shards',
			'/rag/search/shards',
			'/search/library/query',
			'/search/rag/query',
			'/rag/search/query',
			'/search/rag/llama/status'
		]
	},
	{
		modulePath: './helper/search/routes/comments.js',
		factoryName: 'commentRoutes',
		routes: ['/search/rag/comments/:comment', '/search/rag/post-comments']
	}
]);

let searchReadiness = {
	ok: false,
	code: 'SEARCH_NOT_WARMED',
	message: 'Search warm-up has not been requested.'
};

function lazyHandler(group, route, context) {
	return async (...argumentsList) => {
		const factory = require(group.modulePath)[group.factoryName];
		const result = await factory(context)[route](...argumentsList);
		return applySearchStatus(context, result);
	};
}

function lazySearchRoutes(context) {
	const routes = {};
	for (const group of ROUTE_GROUPS) {
		for (const route of group.routes) {
			routes[route] = lazyHandler(group, route, context);
		}
	}
	return routes;
}

function warmSearchRoutes() {
	const {
		configuredRoot,
		warmRagCommentSource
	} = require('./helper/search/rag/ragStartupWarmup.js');
	const {
		assertStorageUnchanged,
		captureCanonicalStorage
	} = require('./helper/search/rag/storageInvariant.js');
	const $i = { db: { directory: configuredRoot() } };
	const storageBefore = captureCanonicalStorage($i);
	const warmup = warmRagCommentSource();
	assertStorageUnchanged(storageBefore, captureCanonicalStorage($i));
	return { ok: true, warmup, storage: storageBefore };
}

function warmSearchRoutesSafely() {
	try {
		searchReadiness = warmSearchRoutes();
	} catch (error) {
		searchReadiness = {
			ok: false,
			code: error.code || 'SEARCH_WARMUP_FAILED',
			message: error.message
		};
	}
	return searchReadiness;
}

function readinessResult(context, readiness) {
	const $i = context?.$i || context;
	if ($i?.response) {
		$i.response.statusCode = readiness.ok ? 200 : 503;
	}
	return { success: readiness };
}

module.exports = (context = {}) => ({
	...lazySearchRoutes(context),
	'/search/readiness': async () => readinessResult(context, searchReadiness),
	'/search/readiness/refresh': async () => (
		readinessResult(context, warmSearchRoutesSafely())
	)
});

module.exports.currentSearchReadiness = () => searchReadiness;
module.exports.lazySearchRoutes = lazySearchRoutes;
module.exports.warmSearchRoutes = warmSearchRoutes;
module.exports.warmSearchRoutesSafely = warmSearchRoutesSafely;
