//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file proceduralSkyVisibility.test.mjs
 * @description Guards the Core-authored physical atmosphere against invisible remote-image or generated-image bootstrap behavior.
 * The sky must remain visible from local procedural shader law while native construction stays in Awtsmoos Procedural Core.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSky3D } from '../../world/Sky3D.js';

/** Proves the shared Core atmosphere is immediately visible without any painted/generated texture dependency. */
test('B"H procedural sky is visible without a remote image', () => {
	const sky = createSky3D('high');
	const dome = sky.children[0];
	const policy = dome.material.texturePolicy;
	const diagnostics = sky.userData.AwtsmoosSky;

	assert.equal(dome.visible, true);
	assert.equal(dome.frustumCulled, false);
	assert.equal(policy.proceduralSky, true);
	assert.equal(policy.proceduralShaderAllowed, true);
	assert.equal(policy.generatedTextureAllowed, false);
	assert.equal(policy.remoteOnly, false);
	assert.equal(policy.semanticRole, 'world-sky-atmosphere');
	assert.equal(Boolean(dome.material.map), false);
	assert.equal(diagnostics.requiresRemoteImage, false);
	assert.equal(diagnostics.coreAuthority, 'awtsmoos-procedural-core');
	assert.equal(diagnostics.source, 'core-procedural-physical-atmosphere');
	assert.equal(diagnostics.technique, 'shared-core-atmosphere-shader');
	assert.equal(dome.userData.family, 'world-sky-atmosphere');
});
