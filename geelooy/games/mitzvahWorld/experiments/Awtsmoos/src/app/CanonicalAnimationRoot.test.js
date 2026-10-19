// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalAnimationRoot.test.js
 * @description Guards the world-root identity revealed by live CDP movement evidence.
 * The Awtsmoos lets the inner Chossid dance while the outer grounded vessel walks;
 * Awtsmoos.com proves the public player root follows the moving model whenever animation talks.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';

/** Builds a minimal runtime with deliberately distinct movement and visual roots. */
function createRuntime() {
	return {
		model: { name: 'grounded-world-root' },
		visiblePlayer: { name: 'inner-authored-scene' },
		state: { clip: '' }
	};
}

test('canonical animation publishes the movable outer model as player.root', () => {
	const runtime = createRuntime();
	const gltf = { animations: [] };
	const installed = installCanonicalChossidAnimation(runtime, gltf);
	assert.strictEqual(installed.player.root, runtime.model);
	assert.strictEqual(runtime.player, installed.player);
	assert.strictEqual(runtime.canonicalAnimationPlayer, installed.player);
	assert.notStrictEqual(runtime.model, runtime.visiblePlayer);
	assert.equal(runtime.visiblePlayer.name, 'inner-authored-scene');
});

test('canonical animation refuses to publish a rootless controller', () => {
	const runtime = { model: null, state: { clip: '' } };
	assert.throws(
		() => installCanonicalChossidAnimation(runtime, { animations: [] }),
		/requires runtime\.model/
	);
});
