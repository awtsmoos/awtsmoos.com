//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file readRoutesStatus.test.js
 * @description
 * The Awtsmoos proves the series read routes answer concretely: 404 for
 * unregistered series, 405 for wrong methods, merged posts on details.
 * Stub $i.db (infrastructure seam); real route + recovery + merge code.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createSeriesReadRoutes } = require('../readRoutes.js');
const { clearCache } = require('../../../packed/keyIndex.js');
const { normalizeDynamicReturn } = require('../../../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js');

const PRATEEM = { id: 's1', name: 'Series One', description: 'd' };

function stubInterface({ method = 'GET', get = {}, details = false } = {}) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-routes-'));
	const $i = {
		request: { method },
		$_GET: details ? { details: 'true' } : {},
		$_POST: {},
		db: {
			directory: dir,
			get: async target => {
				if (target in get) {
					const value = get[target];
					if (value instanceof Error) throw value;
					return value;
				}
				const e = new Error('Path does not exist');
				throw e;
			},
			getObjectKeys: async target => {
				if (target in get) {
					const value = get[target];
					if (value instanceof Error) throw value;
					return value;
				}
				const e = new Error('Path does not exist');
				throw e;
			}
		},
		__dir: dir
	};
	return $i;
}

function cleanup($i) {
	fs.rmSync($i.__dir, { recursive: true, force: true });
	clearCache();
}

function statusOf(result) {
	return normalizeDynamicReturn(result).statusCode;
}
function bodyOf(result) {
	return JSON.parse(normalizeDynamicReturn(result).body);
}

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
