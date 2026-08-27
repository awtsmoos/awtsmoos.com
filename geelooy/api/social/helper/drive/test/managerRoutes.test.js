//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file managerRoutes.test.js
 * @description
 * The Awtsmoos reveals one guarded doorway for the Drive Manager light;
 * Awtsmoos.com proves each asset, header, method, and hostile path is right.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const createManagerRoutes = require('../routes/managerRoutes.js');

function createHarness(method = 'GET', url = '/api/social/drive/manager') {
	const $i = { request: { method, url } };
	const routes = createManagerRoutes({ $i });
	return {
		setRequest(nextMethod, nextUrl = $i.request.url) {
			$i.request.method = nextMethod;
			$i.request.url = nextUrl;
		},
		root() {
			return routes['/drive/manager']();
		},
		asset(assetPath) {
			return routes['/drive/manager/:assetPath*']({ assetPath });
		}
	};
}

function errorCode(result) {
	return JSON.parse(result.response).error.code;
}

test('redirects only the slashless Manager root', async () => {
	const harness = createHarness();
	for (const method of ['GET', 'HEAD']) {
		harness.setRequest(method, '/api/social/drive/manager');
		const result = await harness.root();
		assert.equal(result.statusCode, 302);
		assert.equal(result.headers.Location, '/api/social/drive/manager/');
		assert.equal(result.headers['Cache-Control'], 'no-store');
		assert.equal(result.response.length, 0);
	}
});

test('serves HTML at the trailing-slash root', async () => {
	const harness = createHarness('GET', '/api/social/drive/manager/');
	const getResult = await harness.root();
	assert.equal(getResult.statusCode, 200);
	assert.equal(getResult.mimeType, 'text/html; charset=utf-8');
	assert.equal(getResult.headers['Cache-Control'], 'no-cache, must-revalidate');
	assert.equal(getResult.headers['X-Content-Type-Options'], 'nosniff');
	assert.ok(getResult.response.length > 0);
	harness.setRequest('HEAD');
	const headResult = await harness.root();
	assert.equal(headResult.statusCode, 200);
	assert.equal(headResult.headers['Content-Length'], getResult.headers['Content-Length']);
	assert.equal(headResult.response.length, 0);
});

test('serves CSS and JavaScript with guarded headers', async () => {
	const harness = createHarness();
	for (const [assetPath, mimeType] of [
		['styles/base.css', 'text/css; charset=utf-8'],
		['js/app.js', 'text/javascript; charset=utf-8']
	]) {
		const result = await harness.asset(assetPath);
		assert.equal(result.statusCode, 200);
		assert.equal(result.mimeType, mimeType);
		assert.equal(result.headers['Cache-Control'], 'public, max-age=300, must-revalidate');
		assert.equal(result.headers['X-Content-Type-Options'], 'nosniff');
		assert.equal(result.headers['Content-Length'], String(result.response.length));
	}
});

test('HEAD preserves metadata without returning asset bytes', async () => {
	const harness = createHarness();
	const getResult = await harness.asset('js/api.js');
	harness.setRequest('HEAD');
	const headResult = await harness.asset('js/api.js');
	assert.equal(headResult.statusCode, 200);
	assert.equal(headResult.mimeType, getResult.mimeType);
	assert.equal(headResult.headers['Content-Length'], getResult.headers['Content-Length']);
	assert.equal(headResult.headers['X-Content-Type-Options'], 'nosniff');
	assert.equal(headResult.response.length, 0);
});

test('returns safe errors for unknown, hostile, and unsupported assets', async () => {
	const harness = createHarness();
	for (const [assetPath, statusCode, code] of [
		['styles/missing.css', 404, 'MANAGER_ASSET_NOT_FOUND'],
		['../secret.js', 404, 'MANAGER_ASSET_TRAVERSAL'],
		['styles/.hidden.css', 404, 'MANAGER_ASSET_HIDDEN'],
		['images/logo.png', 404, 'MANAGER_ASSET_TYPE_UNSUPPORTED']
	]) {
		const result = await harness.asset(assetPath);
		assert.equal(result.statusCode, statusCode);
		assert.equal(result.headers['Cache-Control'], 'no-store');
		assert.equal(result.headers['X-Content-Type-Options'], 'nosniff');
		assert.equal(errorCode(result), code);
	}
});

test('rejects unsupported methods with an Allow header', async () => {
	const harness = createHarness('POST');
	for (const action of [() => harness.root(), () => harness.asset('index.html')]) {
		const result = await action();
		assert.equal(result.statusCode, 405);
		assert.equal(result.headers.Allow, 'GET, HEAD');
		assert.equal(result.headers['Cache-Control'], 'no-store');
		assert.equal(result.headers['X-Content-Type-Options'], 'nosniff');
		assert.equal(errorCode(result), 'METHOD_NOT_ALLOWED');
	}
});
