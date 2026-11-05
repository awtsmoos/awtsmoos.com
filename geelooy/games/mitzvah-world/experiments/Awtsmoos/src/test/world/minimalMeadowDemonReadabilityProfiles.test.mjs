//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file minimalMeadowDemonReadabilityProfiles.test.mjs
 * @description Proves ten live enemies remain visually distinct while their authored remote hide is still pending.
 * Identity comes from bounded profile tint plus anatomical vertex modulation; remote candidates supply eventual imagery,
 * while generated canvas textures remain forbidden and therefore cannot become a hidden memory or startup cost.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MINIMAL_MEADOW_ENEMY_PROFILES } from '../../app/MinimalMeadowEnemyProfiles.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';
import { measureDemonMaterialReadability } from '../../app/MinimalMeadowDemonReadabilityMetrics.js';
import { minimalShadowTextureDiagnostics } from '../../app/MinimalMeadowCreatureTexture.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';

test('every live enemy receives a distinct readable remote-pending surface profile', () => {
	const geometry = createMinimalDemonGeometry();
	const records = MINIMAL_MEADOW_ENEMY_PROFILES.map(profile => {
		const material = createMinimalDemonMaterial(profile);
		return {
			material,
			metrics: measureDemonMaterialReadability(geometry, material),
			profile,
			remote: prepareRemoteMaterialForHydration({ name: profile.id }, material)
		};
	});
	const expectedCount = MINIMAL_MEADOW_ENEMY_PROFILES.length;
	assert.equal(expectedCount, 10);
	assert.equal(new Set(records.map(record => record.profile.id)).size, expectedCount);
	assert.equal(new Set(records.map(record => record.material.surfaceDiagnostics.family)).size, expectedCount);
	assert.equal(new Set(records.map(record => record.material.color.slice(0, 3).join(','))).size, expectedCount);
	for (const { material, metrics, remote } of records) {
		assert.equal(material.vertexColors, true);
		assert.equal(material.roughnessFactor, 0.78);
		assert.ok(material.emissiveStrength <= 0.06);
		assert.equal(material.mapImage, null);
		assert.equal(material.surfaceDiagnostics.mapBound, false);
		assert.equal(material.surfaceDiagnostics.mapHasRealData, false);
		assert.equal(material.texturePolicy.remoteOnly, true);
		assert.equal(material.texturePolicy.semanticRole, 'creature.fur');
		assert.equal(remote.role, 'creature.fur');
		assert.ok(remote.candidates.length > 0);
		assert.ok(metrics.baseColorLuminance >= 0.27);
		assert.ok(metrics.baseColorLuminance <= 0.43);
		assert.ok(metrics.averageVisibleLuminance > metrics.minimumVisibleLuminance);
		assert.ok(metrics.minimumVisibleLuminance > 0.001);
		for (const region of ['eyes', 'face', 'torso', 'arms', 'legs']) {
			assert.ok(metrics.anatomy[region]?.count > 0, `${region} must be measured`);
		}
	}
	const texture = minimalShadowTextureDiagnostics();
	assert.equal(texture.generatedTexturesEnabled, false);
	assert.equal(texture.allocations, 0);
	assert.equal(texture.perFrameAllocations, 0);
	assert.deepEqual(texture.cachedFamilies, []);
});
