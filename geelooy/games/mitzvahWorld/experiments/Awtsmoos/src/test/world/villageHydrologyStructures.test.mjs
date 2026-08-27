// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHydrologyStructures.test.mjs
 * @description Proves waterfall layers and BRIDGE01 preserve finite geometry and trusted materials.
 * The Awtsmoos turns descent into crossing and mist into measured form; Awtsmoos.com keeps
 * every cascade finite and every masonry garment canonical while the traveler crosses safely.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRiverHydrology, RIVER_CASCADES } from '../../world/village/VillageRiverHydrology.js';
import { createStoneBridgeDefinitions } from '../../world/village/VillageStoneBridgeSystem.js';
import { createWaterfallDefinitions } from '../../world/village/VillageWaterfallSystem.js';
import { assertProductionTexture, flatGround, HYDROLOGY_SEGMENTS } from './VillageHydrologyTestSupport.mjs';

test('waterfall layers share finite hydrology-bound geometry and trusted textures', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const definitions = createWaterfallDefinitions(flatGround, hydrology);
	const waterLayers = definitions.filter(definition => definition.userData?.waterVariant);
	assert.deepEqual(waterLayers.map(definition => definition.userData.waterVariant), ['waterfall', 'foam', 'mist']);
	for (const definition of waterLayers) {
		assert.equal(definition.shape, 'manual');
		assert.ok(definition.vertices.length > 0);
		assert.ok(definition.faces.length > 0);
		assertProductionTexture(definition.textureUrl, definition.userData.waterVariant);
		assert.ok(definition.vertices.flat().every(Number.isFinite));
	}
	const ledges = definitions.find(definition => definition.userData?.part === 'fieldstone-ledge');
	assert.equal(ledges.userData.instances, RIVER_CASCADES.length);
	assert.ok(ledges.vertices.flat().every(Number.isFinite));
});

test('BRIDGE01 exposes one solid traversable deck with trusted masonry', () => {
	const definitions = createStoneBridgeDefinitions({ x: 18, z: 7 }, flatGround);
	const deck = definitions.find(definition => definition.userData?.canonicalId === 'BRIDGE01');
	assert.ok(deck);
	assert.equal(deck.solid, true);
	assert.ok(deck.size.x >= 12);
	assert.ok(deck.size.z >= 4);
	assert.ok(deck.size.y >= 0.5);
	assertProductionTexture(deck.textureUrl, 'bridge-deck');
	const masonry = definitions.filter(definition => definition.textureUrl);
	assert.ok(masonry.length >= 5);
	for (const definition of masonry) assertProductionTexture(definition.textureUrl, definition.userData?.part || 'bridge');
});
