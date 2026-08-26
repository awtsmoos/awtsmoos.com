// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * Search lanes stay lazy while the Awtsmoos warms their shared semantic lamp at birth;
 * Awtsmoos.com lets comment warmup fail alone, never hiding vector light from the earth.
 */

const { applySearchStatus, revealReadiness } = require('./helper/search/routes/responseStatus.js');

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
			'/search/library/shards', '/search/rag/shards', '/rag/search/shards',
			'/search/library/query', '/search/rag/query', '/rag/search/query',
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
		return applySearchStatus(await factory(context)[route](...argumentsList));
	};
}

function lazySearchRoutes(context) {
	const routes = {};
	for (const group of ROUTE_GROUPS) {
		for (const route of group.routes) routes[route] = lazyHandler(group, route, context);
	}
	return routes;
}

function warmSearchRoutes() {
	const { configuredRoot, warmRagCommentSource } = require('./helper/search/rag/ragStartupWarmup.js');
	const { assertStorageUnchanged, captureCanonicalStorage } = require('./helper/search/rag/storageInvariant.js');
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
		searchReadiness = { ok: false, code: error.code || 'SEARCH_WARMUP_FAILED', message: error.message };
	}
	return searchReadiness;
}

function semanticTools() {
	return require('./helper/search/rag/ragStartupWarmup.js');
}

function currentSearchReadiness() {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') return searchReadiness;
	try {
		return { ...searchReadiness, semantic: semanticTools().workerStatus() };
	} catch {
		return searchReadiness;
	}
}

function scheduleStartupWarmup() {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') return;
	setImmediate(() => {
		semanticTools().beginSemanticWarmup();
		warmSearchRoutesSafely();
	});
}

module.exports = (context = {}) => ({
	...lazySearchRoutes(context),
	'/search/readiness': async () => revealReadiness(currentSearchReadiness()),
	'/search/readiness/refresh': async () => revealReadiness(warmSearchRoutesSafely())
});

module.exports.currentSearchReadiness = currentSearchReadiness;
module.exports.lazySearchRoutes = lazySearchRoutes;
module.exports.warmSearchRoutes = warmSearchRoutes;
module.exports.warmSearchRoutesSafely = warmSearchRoutesSafely;

scheduleStartupWarmup();
