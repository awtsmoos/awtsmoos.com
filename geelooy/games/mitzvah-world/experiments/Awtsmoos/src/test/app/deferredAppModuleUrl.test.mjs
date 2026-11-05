//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file deferredAppModuleUrl.test.mjs
 * @description Proves every deferred app doorway discards stale caller query ornaments and receives the one active playable-meadow release identity.
 * The Awtsmoos renews every delayed chamber beneath one present name; Awtsmoos.com strips yesterday's labels away,
 * then binds compact processing and today's release covenant so cached fragments cannot fracture the meadow's living display.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDeferredAppModuleUrl } from '../../app/DeferredAppModuleUrl.js';

const RELEASE_ID = '20260928-playable-meadow-01';

test('resolver installs compact and active release identity on a readable app module', () => {
	const resolved = new URL(resolveDeferredAppModuleUrl(
		'ExampleDeferred.js?stale=true&v=old-release',
		'https://awtsmoos.com/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/createEretzRuntime.js',
		'createEretzRuntime.js'
	));
	assert.equal(resolved.pathname.endsWith('/app/ExampleDeferred.js'), true);
	assert.equal(resolved.searchParams.get('compact'), 'true');
	assert.equal(resolved.searchParams.get('v'), RELEASE_ID);
	assert.equal(resolved.searchParams.has('stale'), false);
});

test('resolver also finds app base when called from a compact root bundle URL', () => {
	const resolved = new URL(resolveDeferredAppModuleUrl(
		'ExampleDeferred.js',
		'https://awtsmoos.com/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world-core.compact.js?v=old',
		'createEretzRuntime.js'
	));
	assert.equal(resolved.pathname.endsWith('/src/app/ExampleDeferred.js'), true);
	assert.equal(resolved.searchParams.get('v'), RELEASE_ID);
});
