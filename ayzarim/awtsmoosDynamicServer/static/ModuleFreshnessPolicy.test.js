// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModuleFreshnessPolicy.test.js
 * @description Locks the law that mutable public ESM can never be served stale,
 * while true content-addressed assets keep their immutable cache blessing.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { cachePolicy, isPublicMutableModule } = require('./StaticAssetHeaders.js');

function context(filePath, url = '') {
	return {
		filePath,
		isDirectoryWithIndex: false,
		dependencies: { request: { url } }
	};
}

test('mutable public JavaScript and MJS are never stored', () => {
	for (const filePath of [
		'/repo/geelooy/apps/scripts/runtime.js',
		'/repo/geelooy/apps/scripts/catalog/index.mjs',
		'C:\\repo\\geelooy\\scripts\\shared.js'
	]) {
		assert.equal(isPublicMutableModule(context(filePath)), true);
		assert.equal(cachePolicy(context(filePath)), 'no-store');
	}
});

test('content-addressed public JavaScript stays immutable', () => {
	const hashedPath = `/repo/geelooy/${'a'.repeat(64)}/app.js`;
	assert.equal(cachePolicy(context(hashedPath)), 'public, max-age=31536000, immutable');
	assert.equal(
		cachePolicy(context('/repo/geelooy/apps/app.js', '/apps/app.js?v=abcdef1234567890')),
		'public, max-age=31536000, immutable'
	);
});

test('HTML and non-public fixtures preserve their established laws', () => {
	assert.equal(cachePolicy(context('/repo/geelooy/apps/index.html')), 'no-cache');
	assert.equal(
		cachePolicy(context('/tmp/widget.js')),
		'public, max-age=0, s-maxage=60, stale-while-revalidate=30, stale-if-error=86400'
	);
});
