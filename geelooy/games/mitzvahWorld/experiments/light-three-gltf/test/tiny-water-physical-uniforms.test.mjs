// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-water-physical-uniforms.test.mjs
 * @description Proves one physical recipe becomes nine deterministic WebGL uniform uploads.
 * The Awtsmoos joins abstract law to visible current; Awtsmoos.com verifies flow, color,
 * ripple, foam, reflection, refraction, and glint cross one renderer boundary exactly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	uploadWaterPhysicalUniforms,
	waterPhysicalProfile
} from '../tiny-water-physical-uniforms.js';

test('physical water profile converts canonical colors and four currents', () => {
	const profile = waterPhysicalProfile({
		texturePolicy: {
			waterPhysical: sampleRecipe()
		}
	}, 2);
	assert.equal(profile.flow.length, 4);
	assert.deepEqual(profile.flow[0], [0.032, 0.009]);
	assert.ok(Math.abs(profile.deepColor[0] - 7 / 255) < 0.000001);
	assert.ok(Math.abs(profile.shallowColor[2] - 189 / 255) < 0.000001);
	assert.deepEqual(profile.waveProfile, [0.11, 0.026, 0.52, 0.12]);
	assert.deepEqual(profile.foamProfile.slice(0, 3), [0.58, 0.11, 0.72]);
	assert.deepEqual(profile.reflectionProfile, [0.74, 0.58, 1.48]);
});

test('uploader uses the existing program locations without another renderer path', () => {
	const calls = [];
	const gl = {
		uniform2fv: (location, value) => calls.push(['2', location, [...value]]),
		uniform3fv: (location, value) => calls.push(['3', location, [...value]]),
		uniform4fv: (location, value) => calls.push(['4', location, [...value]])
	};
	const locations = Object.fromEntries([
		'waterFlowA', 'waterFlowB', 'waterFlowC', 'waterFlowD',
		'waterDeepColor', 'waterShallowColor', 'waterWaveProfile',
		'waterFoamProfile', 'waterReflectionProfile'
	].map(name => [name, name]));
	uploadWaterPhysicalUniforms(gl, locations, {
		texturePolicy: { waterPhysical: sampleRecipe() }
	}, 2);
	assert.equal(calls.length, 9);
	assert.deepEqual(calls.map(call => call[1]), Object.keys(locations));
});

function sampleRecipe() {
	return {
		depth: { deepColor: '#075065', shallowColor: '#4bafbd', strength: 0.52 },
		flow: [[0.032, 0.009], [-0.018, 0.027], [0.021, -0.008], [-0.011, -0.019]],
		foam: { edge: 0.58, noiseScale: 0.11, threshold: 0.72 },
		reflection: { fresnel: 0.74, skyStrength: 0.58, goldenSunGlint: 1.48 },
		refraction: 0.12,
		ripples: { macro: 0.11, micro: 0.026 }
	};
}
