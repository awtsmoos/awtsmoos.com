// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDemonReadabilityProfiles.test.mjs
 * @description Proves every live enemy receives a distinct readable measured surface.
 * The Awtsmoos reveals ten trials without visual confusion; Awtsmoos.com measures face, torso,
 * limbs, luminance, texture data, and bounded emissive light for every current combat identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MINIMAL_MEADOW_ENEMY_PROFILES } from '../../app/MinimalMeadowEnemyProfiles.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';
import { measureDemonMaterialReadability } from '../../app/MinimalMeadowDemonReadabilityMetrics.js';

const documentValue = fakeDocument();

test('every live enemy receives one distinct readable surface profile', () => {
	const geometry = createMinimalDemonGeometry();
	const records = MINIMAL_MEADOW_ENEMY_PROFILES.map(profile => {
		const material = createMinimalDemonMaterial(profile, documentValue);
		return {
			material,
			metrics: measureDemonMaterialReadability(geometry, material),
			profile
		};
	});
	const expectedCount = MINIMAL_MEADOW_ENEMY_PROFILES.length;
	assert.equal(expectedCount, 10);
	assert.equal(new Set(records.map(record => record.profile.id)).size, expectedCount);
	assert.equal(new Set(records.map(record => (
		record.material.surfaceDiagnostics.family
	))).size, expectedCount);
	assert.equal(new Set(records.map(record => record.material.mapImage)).size, expectedCount);
	assert.equal(new Set(records.map(record => (
		record.material.color.slice(0, 3).join(',')
	))).size, expectedCount);
	for (const { material, metrics } of records) {
		assert.equal(material.vertexColors, true);
		assert.equal(material.roughnessFactor, 0.78);
		assert.ok(material.emissiveStrength <= 0.06);
		assert.equal(material.surfaceDiagnostics.mapBound, true);
		assert.equal(material.surfaceDiagnostics.mapHasRealData, true);
		assert.ok(metrics.baseColorLuminance >= 0.27);
		assert.ok(metrics.baseColorLuminance <= 0.43);
		assert.ok(metrics.averageVisibleLuminance > metrics.minimumVisibleLuminance);
		assert.ok(metrics.minimumVisibleLuminance > 0.001);
		for (const region of ['eyes', 'face', 'torso', 'arms', 'legs']) {
			assert.ok(metrics.anatomy[region]?.count > 0, `${region} must be measured`);
		}
	}
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
