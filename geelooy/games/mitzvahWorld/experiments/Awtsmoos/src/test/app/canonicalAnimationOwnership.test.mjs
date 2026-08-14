// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalAnimationOwnership.test.mjs
 * @description Proves later gameplay composition cannot replace a hydrated canonical Chossid controller with an empty animation shell.
 * The Awtsmoos gives one body one motion identity; Awtsmoos.com guards that identity when serialized/bootstrap GLTF state no longer
 * carries animations, ensuring gameplay and Movie Studio keep the already-bound controller rather than silently losing authored clips.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalAnimationPlayerEvidence,
	resolveMinimalMeadowAnimationPlayer
} from '../../app/MinimalMeadowAnimationPlayer.js';

test('canonical controller survives later empty playerGltf animation state', () => {
	const model = {};
	const canonical = {
		names: ['stand_Armature', 'walk_Armature'],
		root: model
	};
	const runtime = {
		canonicalAnimationPlayer: canonical,
		model,
		playerGltf: { animations: [] }
	};
	const resolved = resolveMinimalMeadowAnimationPlayer(runtime);
	assert.equal(resolved, canonical);
	assert.deepEqual(canonicalAnimationPlayerEvidence(runtime), {
		available: true,
		clipCount: 2,
		modelMatches: true,
		names: ['stand_Armature', 'walk_Armature']
	});
});

test('different model does not reuse stale canonical controller', () => {
	const oldModel = {};
	const newModel = {};
	const runtime = {
		canonicalAnimationPlayer: { names: ['stand_Armature'], root: oldModel },
		model: newModel,
		playerGltf: { animations: [] }
	};
	const resolved = resolveMinimalMeadowAnimationPlayer(runtime);
	assert.notEqual(resolved, runtime.canonicalAnimationPlayer);
	assert.equal(resolved.root, newModel);
	assert.equal(resolved.names.length, 0);
});
