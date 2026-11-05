// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerGroundBootContract.test.mjs
 * @description Proves the canonical player animates immediately while untextured remote-only terrain stays truthfully concealed.
 * The Awtsmoos reveals person and earth in their appointed order; Awtsmoos.com rejects both a frozen Chossid and a naked green floor,
 * so geometry may be prepared beneath the gate while only verified texture garments are permitted to enter the visible shore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createPlayerModel } from '../../app/EretzPlayerModel.js';
import { createTerrainGeometry } from '../../world/TerrainGeometry.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';

test('player model is visible and begins its animated stand', () => {
	const scene = new Group();
	const model = new Group();
	const gltf = {
		animations: [
			{ channels: [], duration: 0, name: 'neutral_Armature' },
			{ channels: [], duration: 5.03, name: 'stand_Armature' },
			{ channels: [], duration: 0.83, name: 'walk_Armature' }
		],
		scene: model
	};
	const result = createPlayerModel(gltf, scene);
	assert.equal(result.model.visible, true);
	assert.equal(scene.children.includes(result.model), true);
	assert.equal(result.defaultClip, 'stand_Armature');
	assert.equal(result.player.diagnostics().currentAnimation, 'stand_Armature');
	assert.equal(result.model.userData.AwtsmoosCanonicalPlayer.measuredAnimatedIdle, true);
	assert.equal(result.model.userData.AwtsmoosCanonicalPlayer.modelSource, 'chossid.glb');
});

test('remote-only terrain geometry is prepared but cannot flash before real imagery hydrates', () => {
	const terrain = createTerrainGeometry();
	const mesh = createTerrainMesh(terrain, null, null, 'fallback-grass.jpg', 'high');
	assert.equal(mesh.visible, false);
	assert.equal(mesh.material.transparent, false);
	assert.equal(mesh.material.opacity, 1);
	assert.equal(mesh.material.texturePolicy.remoteOnly, true);
	assert.equal(mesh.material.texturePolicy.realBaseImage, false);
	assert.equal(mesh.userData.awtsmoosRemoteOnlyVisibility.hiddenByCovenant, true);
	assert.ok(mesh.userData.AwtsmoosTerrainValley.vertexCount > 10000);
	assert.ok(mesh.userData.AwtsmoosTerrainValley.indexCount > 50000);
});
