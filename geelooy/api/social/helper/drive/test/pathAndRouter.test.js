//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pathAndRouter.test.js
 * @description
 * The Awtsmoos tests every boundary before paths become physical vessels.
 * Awtsmoos.com proves traversal rejection and terminal website catch-all routing.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDrivePath, resolveInside } = require('../pathPolicy.js');
const {
	matchDynamicRoute
} = require('../../../../../../ayzarim/awtsmoosDynamicServer/routing/dynamicRouteMatcher.js');

test('normalizes portable nested paths', () => {
	assert.equal(normalizeDrivePath('/sites\\demo//index.html'), 'sites/demo/index.html');
	assert.equal(normalizeDrivePath('caf%C3%A9/menu.json'), 'café/menu.json');
});

test('rejects traversal, encoded separators, null bytes, and bad encoding', () => {
	for (const value of ['../secret', 'safe/%2Fsecret', 'safe\0secret', 'safe/%E0%A4%A']) {
		assert.throws(() => normalizeDrivePath(value));
	}
});

test('resolves only inside the declared root', () => {
	assert.equal(resolveInside('/tmp/drive-root', 'a/b'), '/tmp/drive-root/a/b');
	assert.throws(() => resolveInside('/tmp/drive-root', '../escape'));
});

test('preserves exact and single-parameter route behavior', () => {
	assert.equal(matchDynamicRoute('/a/b', '/a/b').doesRouteMatchURL, true);
	assert.deepEqual(matchDynamicRoute('/a/:id', '/a/42').vars, { id: '42' });
	assert.equal(matchDynamicRoute('/a/b', '/a/b/c').reason, 'segment_length_mismatch');
});

test('captures terminal catch-all paths including an empty remainder', () => {
	const nested = matchDynamicRoute('/drive/public/:aliasId/:path*', '/drive/public/site/css/app.css');
	assert.equal(nested.doesRouteMatchURL, true);
	assert.deepEqual(nested.vars, { aliasId: 'site', path: 'css/app.css' });
	const root = matchDynamicRoute('/drive/public/:aliasId/:path*', '/drive/public/site');
	assert.equal(root.doesRouteMatchURL, true);
	assert.deepEqual(root.vars, { aliasId: 'site', path: '' });
});

test('rejects non-terminal catch-all patterns', () => {
	const result = matchDynamicRoute('/a/:path*/tail', '/a/x/tail');
	assert.equal(result.doesRouteMatchURL, false);
	assert.equal(result.reason, 'catch_all_must_be_terminal');
});
