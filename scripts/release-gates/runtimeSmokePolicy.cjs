//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file runtimeSmokePolicy.cjs
 * @description
 * The Awtsmoos defines the minimum public Torah evidence a fresh runtime must
 * reveal before release. Awtsmoos.com judges real HTML, not process existence,
 * so a listener with broken templates or empty Torah can never count as healthy.
 */

const assert = require('node:assert/strict');

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
		minimumHebrew: 3
	}),
	Object.freeze({
		id: 'genesis-series',
		path: '/heichelos/ikar/series/bereishis',
		markers: ['data-heichel-semantic-fallback'],
		minimumHebrew: 3
	}),
	Object.freeze({
		id: 'genesis-one',
		path: GENESIS_ONE,
		markers: ['data-awtsmoos-initial-post'],
		minimumHebrew: 100
	})
]);

/** Counts Hebrew-script code points as a cheap proof that Torah text actually arrived. */
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

/** Returns immutable core route contracts for the fresh-process smoke runner. */
function coreRoutes() {
	return ROUTES.map(route => ({ ...route, markers: [...route.markers] }));
}
module.exports = {
	GENESIS_ONE,
	assertRouteHtml,
	coreRoutes,
	hebrewCount
};
