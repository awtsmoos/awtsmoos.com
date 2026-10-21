//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file readRoutesStatusPart2.test.js
 * @description Second half of readRoutesStatus.test.js, moved verbatim; self-sufficient via readRoutesStatusStub.js.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { createSeriesReadRoutes } = require('../readRoutes.js');
const { PRATEEM, stubInterface, cleanup, statusOf, bodyOf } = require('./readRoutesStatusStub.js');

test('details merge legacy posts and stay HTTP 200', async () => {
	const legacyPosts = { p1: { author: 'a1', postId: 'p1', title: 'Legacy Post' } };
	const $i = stubInterface({
		details: true,
		get: {
			'/social/heichelos/h1/series/s1/prateem': PRATEEM,
			'/social/heichelos/h1/series/s1/subSeries': [],
			'/social/heichelos/h1/series/s1/posts': legacyPosts
		}
	});
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series']({ heichel: 'h1', series: 's1' });
		assert.equal(statusOf(result), 200);
		assert.equal(result.posts.p1.title, 'Legacy Post');
		assert.equal(result.posts.p1._source, 'legacy');
		assert.equal(result.prateem.name, 'Series One');
	} finally { cleanup($i); }
});

test('details for unregistered series: HTTP 404', async () => {
	const $i = stubInterface({ details: true });
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series']({ heichel: 'h1', series: 'ghost' });
		assert.equal(statusOf(result), 404);
	} finally { cleanup($i); }
});

test('bulk details POST keeps per-id errors plain inside success', async () => {
	const $i = stubInterface({
		method: 'POST',
		get: { '/social/heichelos/h1/series/s1/prateem': PRATEEM }
	});
	$i.$_POST = { seriesIds: ['s1', 'ghost'] };
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series/details']({ heichel: 'h1', series: 's1' });
		assert.equal(statusOf(result), 200);
		assert.ok(result.success.s1.prateem);
		assert.equal(result.success.ghost.error.code, 'SERIES_NOT_FOUND');
	} finally { cleanup($i); }
});

test('bulk details POST with empty ids: HTTP 400', async () => {
	const $i = stubInterface({ method: 'POST' });
	$i.$_POST = { seriesIds: [] };
	try {
		const routes = createSeriesReadRoutes({ $i });
		const result = await routes['/heichelos/:heichel/series/:series/details']({ heichel: 'h1', series: 's1' });
		assert.equal(statusOf(result), 400);
	} finally { cleanup($i); }
});