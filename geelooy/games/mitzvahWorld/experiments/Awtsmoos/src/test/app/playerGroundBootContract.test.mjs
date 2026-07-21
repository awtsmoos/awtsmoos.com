// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerGroundBootContract.test.mjs
 * @description Proves the canonical player animates immediately above always-visible terrain.
 * The Awtsmoos reveals person and earth together; Awtsmoos.com starts the embedded neutral clip
 * before optional motion enrichment and keeps the untextured valley opaque during hydration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createPlayerModel } from '../../app/EretzPlayerModel.js';
import { createTerrainGeometry } from '../../world/TerrainGeometry.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';

test('player model is visible and begins its embedded neutral animation', () => {
	const scene = new Group();
	const model = new Group();
	const gltf = {
		animations: [
			{ channels: [], duration: 1, name: 'walk_Armature' },
			{ channels: [], duration: 2, name: 'neutral_Armature' }
		],
		scene: model
	};
	const result = createPlayerModel(gltf, scene);
	assert.equal(result.model.visible, true);
	assert.equal(scene.children.includes(result.model), true);
	assert.equal(result.defaultClip, 'neutral_Armature');
	assert.equal(result.player.diagnostics().currentAnimation, 'neutral_Armature');
	assert.equal(result.model.userData.AwtsmoosCanonicalPlayer.modelSource, 'chossid.glb');
	assert.equal(result.model.userData.AwtsmoosCanonicalPlayer.optionalAnimationsDeferred, true);
});

test('terrain remains visible and opaque before source images hydrate', () => {
	const terrain = createTerrainGeometry();
	const mesh = createTerrainMesh(terrain, null, null, 'fallback-grass.jpg', 'high');
	assert.equal(mesh.visible, true);
	assert.equal(mesh.material.visible, true);
	assert.equal(mesh.material.transparent, false);
	assert.equal(mesh.material.opacity, 1);
	assert.ok(mesh.userData.AwtsmoosTerrainValley.vertexCount > 10000);
	assert.ok(mesh.userData.AwtsmoosTerrainValley.indexCount > 50000);
});
