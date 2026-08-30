// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * The Awtsmoos keeps every search door light until a seeker enters, then warms the exact database vessel already living inside that request;
 * Awtsmoos.com refuses a second imaginary root, preserves lazy route imports, and lets readiness report the same storage truth that semantic queries inspect.
 */

const {
	applySearchStatus,
	revealReadiness
} = require('./helper/search/routes/responseStatus.js');
const { ROUTE_GROUPS } = require('./helper/search/routes/routeGroups.js');

let searchReadiness = {
	ok: false,
	code: 'SEARCH_NOT_WARMED',
	message: 'Search warm-up has not been requested.'
};

/** Builds one lazy route handler without warming or importing its engine at route-table creation time. */
function lazyHandler(group, route, context) {
	return async (...argumentsList) => {
		const factory = require(group.modulePath)[group.factoryName];
		const response = await factory(context)[route](...argumentsList);
		return applySearchStatus(response);
	};
}

/** Reveals all configured search paths while retaining per-route lazy imports. */
function lazySearchRoutes(context) {
	const routes = {};
	for (const group of ROUTE_GROUPS) {
		for (const route of group.routes) {
			routes[route] = lazyHandler(group, route, context);
		}
	}
	return routes;
}

/** Extracts the real request interface from the social API vessel. */
function requestInterface(context = {}) {
	return context.$i || context;
}

/** Warms search against the request's database root and proves storage remains unchanged. */
function warmSearchRoutes(context = {}) {
	const { warmRagCommentSource } = require('./helper/search/rag/ragStartupWarmup.js');
	const {
		assertStorageUnchanged,
		captureCanonicalStorage
	} = require('./helper/search/rag/storageInvariant.js');
	const $i = requestInterface(context);
	const storageBefore = captureCanonicalStorage($i);
	const warmup = warmRagCommentSource($i);
	assertStorageUnchanged(storageBefore, captureCanonicalStorage($i));
	return {
		ok: true,
		warmup,
		storage: storageBefore
	};
}

/** Records warmup failure as readiness state without taking unrelated social routes down. */
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

/** Adds current semantic-worker state to the last explicit readiness result. */
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
