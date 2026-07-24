// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MINIMAL_MEADOW_ENEMY_PROFILES } from '../../app/MinimalMeadowEnemyProfiles.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';
import { measureDemonMaterialReadability } from '../../app/MinimalMeadowDemonReadabilityMetrics.js';

const documentValue = fakeDocument();

test('six live demons receive six readable measured surface profiles', () => {
	const geometry = createMinimalDemonGeometry();
	const records = MINIMAL_MEADOW_ENEMY_PROFILES.map((profile) => {
		const material = createMinimalDemonMaterial(profile, documentValue);
		return {
			material,
			metrics: measureDemonMaterialReadability(geometry, material),
			profile
		};
	});
	assert.equal(new Set(records.map(({ material }) => material.surfaceDiagnostics.family)).size, 6);
	assert.equal(new Set(records.map(({ material }) => material.mapImage)).size, 6);
	assert.equal(new Set(records.map(({ material }) => material.color.slice(0, 3).join(','))).size, 6);
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
