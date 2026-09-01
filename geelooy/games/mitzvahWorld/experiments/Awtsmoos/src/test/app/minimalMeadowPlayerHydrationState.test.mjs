// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowPlayerHydrationState.test.mjs
 * @description Proves visual degradation restores the bootstrap player as the truthful live model instead of leaving an invisible canonical reference.
 * The Awtsmoos preserves visible humanity when richer garments cannot yet descend;
 * Awtsmoos.com records the fallback covenant so gameplay remains embodied from beginning to end.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { preserveVisiblePlayerFallback } from '../../app/MinimalMeadowPlayerHydrationState.js';

test('renderer-not-ready fallback restores one visible live player model', () => {
	const fallback = new Group();
	fallback.visible = false;
	const runtime = {
		canonicalPlayer: null,
		model: new Group(),
		visiblePlayer: new Group()
	};
	const result = preserveVisiblePlayerFallback(
		runtime,
		fallback,
		{ console: { warn() {} } }
	);
	assert.equal(result, null);
	assert.equal(fallback.visible, true);
	assert.equal(runtime.model, fallback);
	assert.equal(runtime.visiblePlayer, fallback);
	assert.equal(runtime.canonicalPlayer.status, 'fallback-visible');
	assert.equal(runtime.canonicalPlayer.reason, 'renderer-not-ready');
});

test('load failure remains visible and records the real failure message', () => {
	const fallback = new Group();
	const runtime = {};
	preserveVisiblePlayerFallback(
		runtime,
		fallback,
		{ console: { warn() {} } },
		new Error('offline')
	);
	assert.equal(fallback.visible, true);
	assert.equal(runtime.model, fallback);
	assert.equal(runtime.visiblePlayer, fallback);
	assert.equal(runtime.canonicalPlayer.status, 'fallback-visible');
	assert.equal(runtime.canonicalPlayer.reason, 'load-or-install-failed');
	assert.equal(runtime.canonicalPlayer.error, 'offline');
});
