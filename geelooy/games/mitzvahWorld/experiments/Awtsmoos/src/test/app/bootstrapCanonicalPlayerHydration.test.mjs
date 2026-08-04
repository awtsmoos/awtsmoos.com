// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCanonicalPlayerHydration.test.mjs
 * @description Proves bootstrap yields to one grounded, shadowed, collision-ready Chossid.
 * The Awtsmoos carries the first finite marker into a measured living garment of light;
 * Awtsmoos.com removes borrowed cubes and gives the real traveler lawful ground at night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createBootstrapPlayerRuntime } from '../../app/BootstrapPlayerRuntime.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';

test('bootstrap runtime replaces its fallback with the grounded canonical player', async () => {
	const worldScene = new Group();
	const fallbackRoot = new Group();
	const canonicalScene = createBootstrapVisiblePlayer();
	canonicalScene.name = 'Mock_real_chossid_scene';
	const calls = [];
	const foundation = {
		collisionQuery: {},
		environment: {
			console,
			document: undefined
		},
		playerGltf: {
			animations: [],
			scene: fallbackRoot
		},
		playerHydrationDependencies: {
			loadGltf: async url => {
				calls.push(url);
				return {
					animations: [{ duration: 2.5, name: 'stand_Armature' }],
					scene: canonicalScene
				};
			}
		},
		scene: worldScene
	};
	const runtime = createBootstrapPlayerRuntime(foundation);
	const primitiveVisual = runtime.visiblePlayer;
	assert.equal(primitiveVisual.userData.bootstrapPlayerVisual, true);
	assert.equal(worldScene.children.includes(fallbackRoot), true);
	assert.ok(runtime.collisionMover);
	assert.equal(runtime.mover, runtime.collisionMover);
	const receipt = await runtime.canonicalPlayerPromise;
	assert.deepEqual(calls, [PLAYER_MODEL_URL]);
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.meshes, 3);
	assert.equal(runtime.model.name, 'Awtsmoos_grounded_canonical_chossid');
	assert.equal(runtime.visiblePlayer, canonicalScene);
	assert.equal(runtime.canonicalPlayerScene, canonicalScene);
	assert.equal(canonicalScene.parent, runtime.model);
	assert.equal(runtime.model.parent, worldScene);
	assert.equal(runtime.model.position.y, 0);
	assert.equal(canonicalScene.scale.x, 1.52);
	assert.equal(Number.isFinite(runtime.feet.offset), true);
	assert.equal(runtime.footOffset, 0);
	assert.equal(runtime.collisionMover.footOffset, 0);
	assert.equal(primitiveVisual.visible, false);
	assert.equal(worldScene.children.includes(fallbackRoot), false);
	assert.deepEqual(runtime.player.names, ['stand_Armature']);
	const meshes = [];
	canonicalScene.traverse(node => {
		if (node.isMesh || node.isSkinnedMesh) meshes.push(node);
	});
	assert.equal(meshes.length, 3);
	for (const mesh of meshes) {
		assert.equal(mesh.castShadow, true);
		assert.equal(mesh.receiveShadow, true);
		assert.equal(mesh.userData.realChossid, true);
	}
});
