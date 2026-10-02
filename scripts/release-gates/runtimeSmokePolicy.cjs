//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file runtimeSmokePolicy.cjs
 * @description
 * The Awtsmoos measures each vessel according to the Torah it must reveal.
 * Awtsmoos.com keeps strict semantic proof for every route while granting the
 * large Ikar cold store and deep post rendering bounded room under host load.
 */

const assert = require('node:assert/strict');

const DEFAULT_ROUTE_TIMEOUT_MS = 9000;
const IKAR_COLD_TIMEOUT_MS = 30000;
const POST_COLD_TIMEOUT_MS = 30000;
const GENESIS_ONE = '/heichelos/ikar/series/bereishis/post/BH_POST_1749198302925_awtsmoos_520';
const TEMPLATE_FAILURES = Object.freeze([
	'thereWasAnAwtsmoosErrorHere',
	'ReferenceError:',
	'Error processing code segment',
	'Startup rupture:'
]);
const ROUTES = Object.freeze([
	Object.freeze({
		id: 'ikar',
		path: '/heichelos/ikar',
		markers: ['data-heichel-semantic-fallback'],
		minimumHebrew: 0,
		timeoutMs: IKAR_COLD_TIMEOUT_MS
	}),
	Object.freeze({
		id: 'genesis-series',
		path: '/heichelos/ikar/series/bereishis',
		markers: ['data-heichel-semantic-fallback'],
		minimumHebrew: 3,
		timeoutMs: DEFAULT_ROUTE_TIMEOUT_MS
	}),
	Object.freeze({
		id: 'genesis-one',
		path: GENESIS_ONE,
		markers: ['data-awtsmoos-initial-post'],
		minimumHebrew: 100,
		timeoutMs: POST_COLD_TIMEOUT_MS
	})
]);

/** Counts Hebrew-script code points as proof that Torah text actually arrived. */
function hebrewCount(text) {
	return (String(text).match(/[\u0590-\u05ff]/g) || []).length;
}

/** Rejects template leaks, missing structural markers, or suspiciously empty Torah. */
function assertRouteHtml(route, html) {
	const body = String(html || '');
	assert(body.length > 0, `${route.id} returned an empty response body`);
	for (const failure of TEMPLATE_FAILURES) {
		assert(!body.includes(failure), `${route.id} leaked ${failure}`);
	}
	for (const marker of route.markers) {
		assert(body.includes(marker), `${route.id} missing required marker ${marker}`);
	}
	assert(
		hebrewCount(body) >= route.minimumHebrew,
		`${route.id} returned too little Hebrew content`
	);
}

/** Returns immutable route contracts, including their bounded HTTP deadlines. */
function coreRoutes() {
	return ROUTES.map(route => ({
		...route,
		markers: [...route.markers]
	}));
}

module.exports = {
	DEFAULT_ROUTE_TIMEOUT_MS,
	GENESIS_ONE,
	IKAR_COLD_TIMEOUT_MS,
	POST_COLD_TIMEOUT_MS,
	assertRouteHtml,
	coreRoutes,
	hebrewCount
};
