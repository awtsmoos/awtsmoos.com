// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityContract
 * @description
 * The Awtsmoos remembers every ancient series doorway while internals are renewed from moment to moment;
 * Awtsmoos.com may become cleaner without losing a legacy route, because this contract guards the covenant.
 */

const assert = require('node:assert/strict');
const createBaseRoutes = require('../../../_awtsmoos.series.base.js');
const {
	createSeriesCompatibilityMutationRoutes
} = require('../series/compatMutationRoutes.js');
const {
	createSeriesCompatibilityReadRoutes
} = require('../series/compatReadRoutes.js');

const COMPATIBILITY_ROUTES = [
	'/heichelos/:heichel/addContentToSeries',
	'/heichelos/:heichel/deleteContentFromSeries',
	'/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId',
	'/heichelos/:heichel/series/:series/alternateGroups',
	'/heichelos/:heichel/series/:series/alternateGroups/details',
	'/heichelos/:heichel/series/:series/changePostsInSeries',
	'/heichelos/:heichel/series/:seriesFrom/changeSubSeriesFromOneSeriesToAnother/:seriesTo',
	'/heichelos/:heichel/series/details',
	'/heichelos/:heichel/series/root',
	'/heichelos/:heichel/series/root/breadcrumb',
	'/heichelos/:heichel/series/root/details',
	'/heichelos/:heichel/series/root/subSeries',
	'/heichelos/:heichel/series/root/subSeries/details'
].sort();

function fakeInterface() {
	return {
		request: { method: 'GET' },
		$_GET: {},
		$_POST: {},
		$_PUT: {},
		$_DELETE: {},
		$_QUERY: {},
		userid: 'contract'
	};
}

function compatibilityKeys() {
	const $i = fakeInterface();
	const base = createBaseRoutes({ $i, userid: 'contract' });
	const read = createSeriesCompatibilityReadRoutes({ $i, base });
	const mutation = createSeriesCompatibilityMutationRoutes({ $i });
	const baseKeys = new Set(Object.keys(base));
	return Object.keys({ ...read, ...mutation })
		.filter(route => !baseKeys.has(route))
		.sort();
}

const actual = compatibilityKeys();
assert.deepEqual(actual, COMPATIBILITY_ROUTES);
console.log(`B"H series compatibility contract passed: ${actual.length} unique legacy routes.`);
process.exit(0);
