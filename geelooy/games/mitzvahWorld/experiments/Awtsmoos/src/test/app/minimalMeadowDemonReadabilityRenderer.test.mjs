// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapVisualMaterial } from '../../app/BootstrapVisualMaterial.js';
import { minimalShadowHideTexture, minimalShadowTextureDiagnostics } from '../../app/MinimalMeadowCreatureTexture.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';

const documentValue = fakeDocument();

test('bootstrap and rich material records preserve local demon readability', () => {
	const ordinaryColor = [0.14, 0.18, 0.2, 1];
	const ordinary = createBootstrapVisualMaterial('meadow-house', ordinaryColor);
	const demon = createBootstrapVisualMaterial('shadow-demon', [0.02, 0.02, 0.02, 1], {
		demon: true
	});
	const rich = createMinimalDemonMaterial({ id: 'tzel-chai' }, documentValue);
	assert.deepEqual(ordinary.color, ordinaryColor);
	assert.equal(ordinary.userData.bootstrapMaterialRecord.globalBrightening, false);
	assert.equal(demon.vertexColors, true);
	assert.ok(demon.userData.bootstrapMaterialRecord.baseColorLuminance >= 0.28);
	assert.ok(demon.userData.bootstrapMaterialRecord.baseColorLuminance <= 0.43);
	assert.equal(rich.map, rich.mapImage);
	assert.equal(rich.userData.richRendererRecord.mapProperty, 'mapImage');
	assert.equal(rich.userData.richRendererRecord.formula, 'uColor * vColor * texel');
	assert.equal(rich.userData.bootstrapRendererRecord.formula, 'uColor * vColor');
	assert.equal(rich.userData.richRendererRecord.roughnessConsumed, false);
});

test('UV data is bound and procedural texture allocation is bounded outside frame updates', () => {
	const profiles = ['tzel-chai', 'esh-katan', 'ruach-afelah', 'shomer-hoshech', 'ketem-layla', 'ayin-raash'];
	for (const id of profiles) minimalShadowHideTexture({ id }, documentValue);
	const first = minimalShadowTextureDiagnostics();
	for (let frame = 0; frame < 20; frame += 1) {
		for (const id of profiles) minimalShadowHideTexture({ id }, documentValue);
	}
	const second = minimalShadowTextureDiagnostics();
	const geometry = createMinimalDemonGeometry();
	const evidence = geometry.userData.AwtsmoosContinuousDemon;
	assert.equal(first.allocations, second.allocations);
	assert.ok(second.allocations <= second.familyLimit);
	assert.equal(second.perFrameAllocations, 0);
	assert.equal(evidence.mapCoordinatesBound, true);
	assert.ok(evidence.uvRange[0] <= 0.01);
	assert.ok(evidence.uvRange[1] >= 0.99);
	assert.ok(evidence.vertexLuminance.maximum - evidence.vertexLuminance.minimum > 0.08);
});

function fakeDocument() {
	return {
		createElement() {
			const context = fakeContext();
			return {
				dataset: {},
				getContext: () => context,
				height: 0,
				width: 0
			};
		}
	};
}

function fakeContext() {
	return new Proxy({}, {
		get(target, key) {
			if (key === 'createRadialGradient') {
				return () => ({ addColorStop() {} });
			}
			if (!(key in target)) target[key] = () => {};
			return target[key];
		},
		set(target, key, value) {
			target[key] = value;
			return true;
		}
	});
}
