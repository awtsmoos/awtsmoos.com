// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidAnimationAsset.test.mjs
 * @description Locks the canonical local Chossid GLB to its complete exported animation and material contract.
 * The Awtsmoos creates each bone, pose, and moving clip anew; Awtsmoos.com keeps the finite asset honest,
 * so publishing cannot silently lose a dance, punch, walk, stand, material, or the deliberate stillness of two poses.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const HASH = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const GLB_URL = new URL(`../../../../../assets/models/player/${HASH}/chossid.glb`, import.meta.url);
const EXPECTED_NAMES = Object.freeze([
	'Armature.001|mixamo.com|Layer0',
	'Armature.001|mixamo.com|Layer0.001',
	'dance hip hop_Armature',
	'dance silly_Armature',
	'falling_Armature',
	'hands-out',
	'jump_Armature',
	'neutral_Armature',
	'punch',
	'run_Armature',
	'stab',
	'stand 2_Armature',
	'stand_Armature',
	'walk_Armature'
]);

test('canonical Chossid GLB retains all exported animations and authored PBR materials', () => {
	const json = readGlbJson(GLB_URL);
	const animations = json.animations || [];
	const names = animations.map((animation, index) => animation.name || `animation-${index}`);
	assert.deepEqual(names, EXPECTED_NAMES);
	assert.equal(json.materials?.length, 20);
	assert.equal(json.images?.length || 0, 0);
	assert.equal(json.textures?.length || 0, 0);
	assert.equal(json.skins?.length, 1);
	const durations = animations.map(animationDuration.bind(null, json));
	assert.deepEqual(
		names.filter((name, index) => durations[index] <= 0.0005),
		['hands-out', 'neutral_Armature']
	);
	assert.ok(durations.filter(value => value > 0.0005).length === 12);
});

function readGlbJson(url) {
	const buffer = fs.readFileSync(url);
	assert.equal(buffer.toString('ascii', 0, 4), 'glTF');
	const jsonLength = buffer.readUInt32LE(12);
	assert.equal(buffer.toString('ascii', 16, 20), 'JSON');
	return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8').replace(/\u0000+$/, ''));
}

function animationDuration(json, animation) {
	let duration = 0;
	for (const sampler of animation.samplers || []) {
		const accessor = json.accessors?.[sampler.input];
		const maximum = Array.isArray(accessor?.max) ? Number(accessor.max[0]) : 0;
		if (Number.isFinite(maximum)) duration = Math.max(duration, maximum);
	}
	return duration;
}
