// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowPlayerHydrationState.test.mjs
 * @description Proves canonical-player failure preserves only the trusted local bootstrap traveler and still removes every unknown predecessor.
 * The Awtsmoos lets the humble first garment remain when distant authored truth cannot arrive;
 * Awtsmoos.com refuses unknown substitutes while protecting the already-visible traveler that made movement honest before the network spoke.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { rejectNoncanonicalPlayerFallback } from '../../app/MinimalMeadowPlayerHydrationState.js';

function predecessor(userData = {}) {
	const value = {
		parent: {
			removed: [],
			remove(object) {
				this.removed.push(object);
				object.parent = null;
			}
		},
		userData,
		visible: true,
		traverse(callback) {
			callback(this);
		}
	};
	return value;
}

test('B"H trusted bootstrap traveler remains visible when canonical hydration fails', () => {
	const local = predecessor({ bootstrapPlayerVisual: true, fallbackVisible: true });
	const runtime = { model: local, visiblePlayer: local };
	const receipt = rejectNoncanonicalPlayerFallback(
		runtime,
		local,
		{},
		new Error('network unavailable')
	);
	assert.equal(receipt.status, 'bootstrap-preserved');
	assert.equal(receipt.fallback, 'bootstrap-visible-player');
	assert.equal(runtime.model, local);
	assert.equal(runtime.visiblePlayer, local);
	assert.equal(runtime.playerVisualGuard, 'bootstrap-visible-fallback');
	assert.equal(local.visible, true);
	assert.equal(local.parent.removed.length, 0);
});

test('B"H unknown predecessor is removed rather than promoted as canonical truth', () => {
	const unknown = predecessor({ fallbackVisible: true });
	const originalParent = unknown.parent;
	const runtime = { model: unknown, visiblePlayer: unknown };
	const receipt = rejectNoncanonicalPlayerFallback(
		runtime,
		unknown,
		{},
		new Error('invalid canonical model')
	);
	assert.equal(receipt, null);
	assert.equal(runtime.canonicalPlayer.status, 'canonical-unavailable');
	assert.equal(runtime.model, null);
	assert.equal(runtime.visiblePlayer, null);
	assert.equal(runtime.playerVisualGuard, null);
	assert.equal(unknown.visible, false);
	assert.deepEqual(originalParent.removed, [unknown]);
});
