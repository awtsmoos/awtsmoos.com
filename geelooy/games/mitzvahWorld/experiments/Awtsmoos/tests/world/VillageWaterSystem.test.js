// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSystem.test.js
 * @description Proves one connected village water story with trusted remote textures and truthful ownership.
 * The Awtsmoos carries one current through lake, river, waterfall, foam, mist, reed, and stone;
 * Awtsmoos.com guards unique composition, animated shader law, and remote material authority.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isSameOriginMaterialUrl } from '../../src/assets/ProductionMaterialUrlPolicy.js';
import { createVillageWaterDefinitions } from '../../src/world/village/VillageWaterSystem.js';

const VILLAGE_DIRECTORY = fileURLToPath(new URL('../../src/world/village/', import.meta.url));
const DRIVE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
const WATER_SHADER = 'alpine-two-fetch-variant-flow-fresnel-foam-water';

test('village water composes one connected source-to-outlet definition set', () => {
	const result = createVillageWaterDefinitions(() => 0);
	const ids = result.definitions.map(definition => definition.id);
	const variants = new Set(result.definitions
		.map(definition => definition.userData?.waterVariant)
		.filter(Boolean));
	assert.equal(new Set(ids).size, ids.length);
	assert.equal(result.stats.connectedSourceToOutlet, true);
	assert.ok(result.stats.waterDraws >= 5);
	assert.ok(result.stats.waterfallCascades >= 1);
	for (const expected of ['lake', 'river', 'waterfall', 'foam', 'mist']) {
		assert.equal(variants.has(expected), true, expected);
	}
});

test('all playable water textures use trusted Awtsmoos Drive authority', () => {
	const { definitions } = createVillageWaterDefinitions(() => 0);
	const textured = definitions.filter(definition => definition.textureUrl);
	assert.ok(textured.length >= 8);
	for (const definition of textured) {
		assert.equal(isSameOriginMaterialUrl(definition.textureUrl), true, definition.id);
		assert.equal(definition.textureUrl.startsWith(DRIVE_ROOT), true, definition.id);
		assert.equal(definition.texturePolicy?.realMaterialRequired, true, definition.id);
		assert.equal(
			definition.texturePolicy?.sameOrigin === true
				|| definition.texturePolicy?.publicFirebase === true,
			true,
			definition.id
		);
		if (definition.mixTextureUrl) {
			assert.equal(isSameOriginMaterialUrl(definition.mixTextureUrl), true, definition.id);
			assert.equal(definition.mixTextureUrl.startsWith(DRIVE_ROOT), true, definition.id);
		}
	}
});

test('animated water uses one physical shader contract', () => {
	const { definitions } = createVillageWaterDefinitions(() => 0);
	const animated = definitions.filter(definition => definition.texturePolicy?.animated === true);
	assert.ok(animated.length >= 5);
	for (const definition of animated) {
		assert.equal(definition.texturePolicy.shader, WATER_SHADER, definition.id);
		assert.ok(definition.texturePolicy.waterPhysical, definition.id);
	}
});

test('river stone batch explicitly owns its public remote material', () => {
	const { definitions } = createVillageWaterDefinitions(() => 0);
	const stones = definitions.find(definition => definition.id === 'Awtsmoos_river_stone_batch');
	assert.equal(stones.texturePolicy.publicFirebase, true);
	assert.equal(stones.texturePolicy.role, 'wet-riverbank-stone-batch');
	assert.equal(stones.textureUrl.startsWith(DRIVE_ROOT), true);
});

test('only VillageWaterSystem composes water bodies and waterfalls together', () => {
	const owners = readdirSync(VILLAGE_DIRECTORY)
		.filter(name => name.endsWith('.js'))
		.filter(name => {
			const source = readFileSync(`${VILLAGE_DIRECTORY}/${name}`, 'utf8');
			return source.includes('createWaterBodyDefinitions')
				&& source.includes('createWaterfallDefinitions');
		});
	assert.deepEqual(owners, ['VillageWaterSystem.js']);
});
