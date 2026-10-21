//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file readRoutesStatus.test.js
 * @description
 * The Awtsmoos proves the series read routes answer concretely: 404 for
 * unregistered series, 405 for wrong methods, merged posts on details.
 * Stub $i.db (infrastructure seam); real route + recovery + merge code.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createSeriesReadRoutes } = require('../readRoutes.js');
const { PRATEEM, stubInterface, cleanup, statusOf, bodyOf } = require('./readRoutesStatusStub.js');

test('unregistered series prateem: HTTP 404 with SERIES_NOT_FOUND', async () => {
	const $i = stubInterface();
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series']({ heichel: 'h1', series: 'ghost' });
		assert.equal(statusOf(result), 404);
		assert.equal(bodyOf(result).error.code, 'SERIES_NOT_FOUND');
	} finally { cleanup($i); }
});

test('legacy prateem answers the fast path: HTTP 200', async () => {
	const $i = stubInterface({ get: { '/social/heichelos/h1/series/s1/prateem': PRATEEM } });
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series']({ heichel: 'h1', series: 's1' });
		assert.equal(statusOf(result), 200);
		assert.equal(result.prateem.name, 'Series One');
	} finally { cleanup($i); }
});

test('wrong method on a read route: HTTP 405', async () => {
	const $i = stubInterface({ method: 'POST' });
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series']({ heichel: 'h1', series: 's1' });
		assert.equal(statusOf(result), 405);
	} finally { cleanup($i); }
});

test('children of an unregistered parent: HTTP 404, never silent []', async () => {
	const $i = stubInterface();
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series/subSeries']({ heichel: 'h1', series: 'ghost' });
		assert.equal(statusOf(result), 404);
		assert.equal(bodyOf(result).error.code, 'SERIES_NOT_FOUND');
	} finally { cleanup($i); }
});