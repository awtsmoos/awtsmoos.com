//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDemonReadabilityRenderer.test.mjs
 * @description Proves demon readability remains rich while generated hide allocation is permanently zero and remote fur owns visibility.
 * The Awtsmoos gives shadow form without counterfeit skin; Awtsmoos.com keeps UV and vertex revelation alive,
 * while no canvas texture is allocated in setup or frames and the remote garment alone may let the creature arrive.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapVisualMaterial } from '../../app/BootstrapVisualMaterial.js';
import { minimalShadowHideTexture, minimalShadowTextureDiagnostics } from '../../app/MinimalMeadowCreatureTexture.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';

test('bootstrap and rich material records preserve demon readability under remote-only law', () => {
	const ordinaryColor = [0.14, 0.18, 0.2, 1];
	const ordinary = createBootstrapVisualMaterial('meadow-house', ordinaryColor);
	const demon = createBootstrapVisualMaterial('shadow-demon', [0.02, 0.02, 0.02, 1], { demon: true });
	const rich = createMinimalDemonMaterial({ id: 'tzel-chai' });
	assert.deepEqual(ordinary.color, ordinaryColor);
	assert.equal(ordinary.userData.bootstrapMaterialRecord.globalBrightening, false);
	assert.equal(demon.vertexColors, true);
	assert.ok(demon.userData.bootstrapMaterialRecord.baseColorLuminance >= 0.28);
	assert.ok(demon.userData.bootstrapMaterialRecord.baseColorLuminance <= 0.43);
	assert.equal(rich.mapImage, null);
	assert.equal(rich.texturePolicy.remoteOnly, true);
	assert.equal(rich.texturePolicy.semanticRole, 'creature.fur');
	assert.equal(rich.vertexColors, true);
});

test('UV readability survives while generated texture allocation stays exactly zero', () => {
	for (const id of ['tzel-chai', 'esh-katan', 'ruach-afelah']) {
		assert.equal(minimalShadowHideTexture({ id }), null);
	}
	const first = minimalShadowTextureDiagnostics();
	for (let frame = 0; frame < 20; frame += 1) {
		minimalShadowHideTexture({ id: `frame-${frame}` });
	}
	const second = minimalShadowTextureDiagnostics();
	const evidence = createMinimalDemonGeometry().userData.AwtsmoosContinuousDemon;
	assert.equal(first.allocations, 0);
	assert.equal(second.allocations, 0);
	assert.equal(second.generatedTexturesEnabled, false);
	assert.equal(second.perFrameAllocations, 0);
	assert.equal(evidence.mapCoordinatesBound, true);
	assert.ok(evidence.uvRange[0] <= 0.01);
	assert.ok(evidence.uvRange[1] >= 0.99);
	assert.ok(evidence.vertexLuminance.maximum - evidence.vertexLuminance.minimum > 0.08);
});
