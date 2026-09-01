// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCanonicalPlayerHydration.test.mjs
 * @description Proves canonical Chossid promotion preserves animation ownership while retaining the rigid WebGL body as a synchronized visibility guard.
 * The Awtsmoos lets authored humanity enter without extinguishing the first dependable silhouette;
 * Awtsmoos.com joins canonical motion and a humble WebGL underlay so every supported device keeps a visible traveler.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createBootstrapPlayerRuntime } from '../../app/BootstrapPlayerRuntime.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';

const STAND_CLIP = Object.freeze({ channels: [], duration: 2.5, name: 'stand_Armature' });

test('first-frame canonical player installs real animation and material contracts immediately', async () => {
	const worldScene = new Group();
	const canonicalScene = createBootstrapVisiblePlayer();
	const foundation = {
		collisionQuery: {},
		playerGltf: { animations: [STAND_CLIP], scene: canonicalScene },
		scene: worldScene
	};
	const runtime = createBootstrapPlayerRuntime(foundation);
	const receipt = await runtime.canonicalPlayerPromise;
	assert.equal(receipt.status, 'ready');
	assert.equal(typeof runtime.player.play, 'function');
	assert.equal(typeof runtime.player.update, 'function');
	assert.deepEqual(runtime.player.names, ['stand_Armature']);
	assert.equal(runtime.player.diagnostics().clipCount, 1);
	assert.equal(runtime.player.diagnostics().currentAnimation, 'stand_Armature');
	assert.equal(runtime.animationCatalog.length, 1);
	assert.equal(runtime.animationCatalog[0].name, 'stand_Armature');
	assert.ok(receipt.materials.materialsVisited > 0);
});

test('renderer-ready canonical promotion preserves a moving rigid WebGL visual guard', async () => {
	const worldScene = new Group();
	const fallbackRoot = new Group();
	const canonicalScene = createBootstrapVisiblePlayer();
	canonicalScene.name = 'Mock_real_chossid_scene';
	const calls = [];
	const foundation = {
		collisionQuery: {},
		environment: { console, document: undefined },
		playerGltf: { animations: [], scene: fallbackRoot },
		playerHydrationDependencies: {
			loadGltf: async url => {
				calls.push(url);
				return { animations: [STAND_CLIP], scene: canonicalScene };
			},
			waitForVisualRenderer: async () => true
		},
		scene: worldScene
	};
	const runtime = createBootstrapPlayerRuntime(foundation);
	const primitiveVisual = runtime.visiblePlayer;
	const receipt = await runtime.canonicalPlayerLaunchPromise;
	assert.deepEqual(calls, [PLAYER_MODEL_URL]);
	assert.equal(receipt.status, 'ready');
	assert.equal(runtime.model.name, 'Awtsmoos_grounded_canonical_chossid');
	assert.equal(runtime.visiblePlayer, canonicalScene);
	assert.equal(runtime.canonicalPlayerScene, canonicalScene);
	assert.equal(runtime.model.parent, worldScene);
	assert.equal(runtime.playerVisualGuard, fallbackRoot);
	assert.equal(fallbackRoot.parent, worldScene);
	assert.equal(fallbackRoot.visible, true);
	assert.equal(primitiveVisual.visible, true);
	assert.equal(fallbackRoot.userData.awtsmoosPlayerVisualGuard, true);
	assert.equal(runtime.collisionMover.footOffset, 0);
	assert.deepEqual(runtime.player.names, ['stand_Armature']);
	assert.equal(runtime.player.diagnostics().currentAnimation, 'stand_Armature');
	assert.equal(runtime.model.userData.AwtsmoosCanonicalPlayer.visualGuard, 'rigid-webgl-underlay');
	assert.equal(canonicalScene.userData.AwtsmoosCanonicalPlayer.modelSource, 'chossid.glb');
});
