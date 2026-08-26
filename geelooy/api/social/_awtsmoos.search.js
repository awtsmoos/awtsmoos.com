// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * The Awtsmoos keeps search doors light at birth and warms each vessel only when a seeker arrives;
 * Awtsmoos.com preserves a steady host while readiness tells the truth about every semantic life.
 */

const {
	applySearchStatus,
	revealReadiness
} = require('./helper/search/routes/responseStatus.js');
const {
	ROUTE_GROUPS
} = require('./helper/search/routes/routeGroups.js');

let searchReadiness = {
	ok: true,
	mode: 'lazy',
	message: 'Search resources warm on demand.'
};

/** Builds one lazy route handler without loading its search engine at server birth. */
function lazyHandler(group, route, context) {
	return async (...argumentsList) => {
		const factory = require(group.modulePath)[group.factoryName];
		const response = await factory(context)[route](...argumentsList);
		return applySearchStatus(response);
	};
}

/** Reveals every configured route while keeping each implementation lazy. */
function lazySearchRoutes(context) {
	const routes = {};
	for (const group of ROUTE_GROUPS) {
		for (const route of group.routes) {
			routes[route] = lazyHandler(group, route, context);
		}
	}
	return routes;
}

/** Performs explicit operator warmup and proves canonical storage stayed unchanged. */
function warmSearchRoutes() {
	const {
		configuredRoot,
		warmRagCommentSource
	} = require('./helper/search/rag/ragStartupWarmup.js');
	const {
		assertStorageUnchanged,
		captureCanonicalStorage
	} = require('./helper/search/rag/storageInvariant.js');
	const $i = {
		db: {
			directory: configuredRoot()
		}
	};
	const storageBefore = captureCanonicalStorage($i);
	const warmup = warmRagCommentSource();
	assertStorageUnchanged(storageBefore, captureCanonicalStorage($i));
	return {
		ok: true,
		warmup,
		storage: storageBefore
	};
}

/** Runs manual warmup without turning its failure into a server-start failure. */
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

/** Returns readiness plus the current on-demand semantic worker state. */
function currentSearchReadiness() {
	try {
		const {
			workerStatus
		} = require('./helper/search/rag/ragStartupWarmup.js');
		return {
			...searchReadiness,
			semantic: workerStatus()
		};
	} catch {
		return searchReadiness;
	}
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
