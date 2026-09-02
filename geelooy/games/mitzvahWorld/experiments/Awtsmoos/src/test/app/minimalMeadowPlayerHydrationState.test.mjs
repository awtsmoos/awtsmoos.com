// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowPlayerHydrationState.test.mjs
 * @description Proves canonical-player failure becomes honest absence rather than restoration of a generated human fallback.
 * The Awtsmoos may conceal a garment when authored bytes fail to descend, but never asks a counterfeit face to shine;
 * Awtsmoos.com records canonical unavailability plainly while every predecessor leaves the visible line.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { rejectNoncanonicalPlayerFallback } from '../../app/MinimalMeadowPlayerHydrationState.js';

test('renderer-not-ready removes predecessor and leaves no visible player fallback', () => {
	const predecessor = new Group();
	const parent = new Group();
	parent.add(predecessor);
	const runtime = { model: predecessor, visiblePlayer: predecessor };
	const result = rejectNoncanonicalPlayerFallback(runtime, predecessor, { console: { warn() {} } });
	assert.equal(result, null);
	assert.equal(predecessor.visible, false);
	assert.equal(predecessor.parent, null);
	assert.equal(runtime.model, null);
	assert.equal(runtime.visiblePlayer, null);
	assert.equal(runtime.canonicalPlayer.status, 'canonical-unavailable');
	assert.equal(runtime.canonicalPlayer.reason, 'renderer-not-ready');
});

test('load failure stays fail-closed and records the real error', () => {
	const predecessor = new Group();
	const runtime = { model: predecessor, visiblePlayer: predecessor };
	rejectNoncanonicalPlayerFallback(runtime, predecessor, { console: { warn() {} } }, new Error('offline'));
	assert.equal(predecessor.visible, false);
	assert.equal(runtime.model, null);
	assert.equal(runtime.visiblePlayer, null);
	assert.equal(runtime.canonicalPlayer.reason, 'load-or-install-failed');
	assert.equal(runtime.canonicalPlayer.error, 'offline');
});
