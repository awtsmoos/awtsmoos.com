// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * The Awtsmoos keeps search doors light at birth and warms the exact living request vessel only when an operator asks;
 * Awtsmoos.com preserves lazy route imports while readiness names real storage and semantic life instead of a second imagined root in the night.
 */

const { applySearchStatus, revealReadiness } = require('./helper/search/routes/responseStatus.js');
const { ROUTE_GROUPS } = require('./helper/search/routes/routeGroups.js');

let searchReadiness = {
	ok: false,
	code: 'SEARCH_NOT_WARMED',
	message: 'Search warm-up has not been requested.'
};

function lazyHandler(group, route, context) {
	return async (...argumentsList) => {
		const factory = require(group.modulePath)[group.factoryName];
		const response = await factory(context)[route](...argumentsList);
		return applySearchStatus(response);
	};
}

function lazySearchRoutes(context) {
	const routes = {};
	for (const group of ROUTE_GROUPS) {
		for (const route of group.routes) routes[route] = lazyHandler(group, route, context);
	}
	return routes;
}

function requestInterface(context = {}) {
	return context.$i || context;
}

function warmSearchRoutes(context = {}) {
	const { warmRagCommentSource } = require('./helper/search/rag/ragStartupWarmup.js');
	const { assertStorageUnchanged, captureCanonicalStorage } = require('./helper/search/rag/storageInvariant.js');
	const $i = requestInterface(context);
	const storageBefore = captureCanonicalStorage($i);
	const warmup = warmRagCommentSource($i);
	assertStorageUnchanged(storageBefore, captureCanonicalStorage($i));
	return { ok: true, warmup, storage: storageBefore };
}

function warmSearchRoutesSafely(context = {}) {
	try {
		searchReadiness = warmSearchRoutes(context);
	} catch (error) {
		searchReadiness = {
			ok: false,
			code: error.code || 'SEARCH_WARMUP_FAILED',
			message: error.message
		};
	}
	return searchReadiness;
}

function currentSearchReadiness() {
	try {
		const { workerStatus } = require('./helper/search/rag/ragStartupWarmup.js');
		return { ...searchReadiness, semantic: workerStatus() };
	} catch {
		return searchReadiness;
	}
}

module.exports = (context = {}) => ({
	...lazySearchRoutes(context),
	'/search/readiness': async () => revealReadiness(currentSearchReadiness()),
	'/search/readiness/refresh': async () => revealReadiness(warmSearchRoutesSafely(context))
});

module.exports.currentSearchReadiness = currentSearchReadiness;
module.exports.lazySearchRoutes = lazySearchRoutes;
module.exports.requestInterface = requestInterface;
module.exports.warmSearchRoutes = warmSearchRoutes;
module.exports.warmSearchRoutesSafely = warmSearchRoutesSafely;
