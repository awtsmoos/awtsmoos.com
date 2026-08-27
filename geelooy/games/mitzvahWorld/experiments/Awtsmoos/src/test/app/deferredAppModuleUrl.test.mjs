// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredAppModuleUrl.test.mjs
 * @description Proves deferred app URLs survive readable-source and compact-bundle execution.
 * The Awtsmoos changes the vessel without losing the appointed destination;
 * Awtsmoos.com preserves lazy boundaries through deterministic URL revelation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDeferredAppModuleUrl } from '../../app/DeferredAppModuleUrl.js';

test('readable app source resolves a sibling deferred module', () => {
	const resolvedUrl = resolveDeferredAppModuleUrl(
		'BootPhaseTracker.js?v=proof-1',
		'http://127.0.0.1:5181/games/mitzvahWorld/experiments/Awtsmoos/src/app/createEretzRuntime.js',
		'createEretzRuntime.js'
	);
	assert.equal(
		resolvedUrl,
		'http://127.0.0.1:5181/games/mitzvahWorld/experiments/Awtsmoos/src/app/BootPhaseTracker.js?v=proof-1'
	);
});

test('compact entry resolves the same deferred module beneath app', () => {
	const resolvedUrl = resolveDeferredAppModuleUrl(
		'BootPhaseTracker.js?v=proof-2',
		'http://127.0.0.1:5181/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js',
		'createEretzRuntime.js'
	);
	assert.equal(
		resolvedUrl,
		'http://127.0.0.1:5181/games/mitzvahWorld/experiments/Awtsmoos/src/app/BootPhaseTracker.js?v=proof-2'
	);
});

test('invalid execution URLs fail instead of producing silent wrong paths', () => {
	assert.throws(
		() => resolveDeferredAppModuleUrl(
			'BootPhaseTracker.js',
			'not a valid absolute URL',
			'createEretzRuntime.js'
		),
		TypeError
	);
});
