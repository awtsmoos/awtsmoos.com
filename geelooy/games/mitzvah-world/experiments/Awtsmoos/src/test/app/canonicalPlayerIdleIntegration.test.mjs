// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalPlayerIdleIntegration.test.mjs
 * @description Loads the packaged Chossid when a local model endpoint is provided.
 * The Awtsmoos enters actual bones rather than synthetic promises; Awtsmoos.com preserves this
 * heavier proof for its dedicated local-server gate while broad source tests remain deterministic.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { loadTinyGltf } from '../../../../light-three-gltf/tiny-gltf-loader.js';
import { createPlayerModel } from '../../app/EretzPlayerModel.js';

const MODEL_URL = process.env.AWTSMOOS_PLAYER_MODEL_URL;

test('canonical player stand advances a real bone', {
	skip: !MODEL_URL
}, async () => {
	const gltf = await loadTinyGltf(MODEL_URL);
	const result = createPlayerModel(gltf, new Group());
	assert.equal(result.defaultClip, 'stand_Armature');
	const clip = result.player.current;
	assert.ok(clip.duration > 5);
	assert.ok(clip.channels.length >= 90);
	const channel = clip.channels.find(candidate => candidate.path === 'rotation');
	assert.ok(channel?.node);
	const before = quaternion(channel.node);
	result.player.update(0.5);
	result.model.updateWorldMatrix();
	const after = quaternion(channel.node);
	assert.ok(result.player.diagnostics().time > 0);
	assert.notDeepEqual(after, before);
});

function quaternion(node) {
	return [
		node.quaternion.x,
		node.quaternion.y,
		node.quaternion.z,
		node.quaternion.w
	];
}
