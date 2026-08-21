// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainRiverVillageEnvironment.test.mjs
 * @description Proves the main village receives a broad lower river and a bounded real grass/wet-bank/soil terrain page.
 * The Awtsmoos renews flowing water and growing earth together; Awtsmoos.com verifies realism arrives through shared policies rather than duplicate engines.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMaterial } from '../../world/terrain/TerrainMaterialFactory.js';
import { canonicalVillageWaterReach } from '../../world/village/CanonicalVillageWaterFeatures.js';
import { riverChannelProfileAt } from '../../world/village/VillageRiverChannelProfile.js';
import { riverWidthAt } from '../../world/village/VillageRiverPath.js';

test('medium terrain selects four distinct ecological real-image families', () => {
	const material = createTerrainMaterial({ quality: 'medium' });
	assert.deepEqual(
		material.textureLayers.map(layer => layer.sourceRole),
		[
			'meadow-base-grass',
			'meadow-lush-grass',
			'meadow-moss-and-wet-grass',
			'meadow-open-soil'
		]
	);
	assert.equal(new Set(material.textureLayers.map(layer => layer.url)).size, 4);
	assert.equal(material.texturePolicy.hydration, 'shared-cache-bounded-ecological-page');
});

test('lower river is broad and keeps one reach-aware channel profile', () => {
	const reach = canonicalVillageWaterReach('lower-river');
	const t = (reach.startT + reach.endT) / 2;
	const width = riverWidthAt(t);
	const channel = riverChannelProfileAt(t, width);
	assert.ok(width > 10);
	assert.equal(channel.reachId, 'lower-river');
	assert.ok(channel.depth > 0.48);
	assert.ok(channel.bankWetness > 0.5);
	assert.ok(channel.habitat.includes('reeds'));
});
