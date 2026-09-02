// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralSkyVisibility.test.mjs
 * @description Guards the local WebGL atmosphere against returning to invisible remote-image bootstrap behavior.
 * The Awtsmoos opens a heaven whose light needs no borrowed painted frame;
 * Awtsmoos.com keeps sun, cloud, and horizon visible while every authored human stays the same.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSky3D } from '../../world/Sky3D.js';
import { PROCEDURAL_SKY_VISUAL_VERSION } from '../../world/sky/ProceduralSkyMeshFactory.js';

/** Proves the local atmosphere is visible and selects the renderer's procedural-sky contract. */
test('B"H procedural sky is visible without a remote image', () => {
	const sky = createSky3D('high');
	const dome = sky.children[0];
	assert.equal(dome.visible, true);
	assert.equal(dome.frustumCulled, false);
	assert.equal(dome.material.texturePolicy.proceduralSky, true);
	assert.equal(dome.material.texturePolicy.remoteOnly, false);
	assert.equal(dome.material.texturePolicy.semanticRole, 'world-sky-atmosphere');
	assert.equal(Boolean(dome.material.map), false);
	assert.equal(sky.userData.AwtsmoosSky.requiresRemoteImage, false);
	assert.equal(sky.userData.AwtsmoosSky.source, 'local-procedural-webgl');
	assert.equal(sky.userData.AwtsmoosSky.version, PROCEDURAL_SKY_VISUAL_VERSION);
	assert.equal(dome.userData.visualQualityVersion, PROCEDURAL_SKY_VISUAL_VERSION);
});
