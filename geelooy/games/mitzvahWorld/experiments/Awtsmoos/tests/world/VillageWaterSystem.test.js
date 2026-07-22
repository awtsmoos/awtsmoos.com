// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSystem.test.js
 * @description Proves one connected, local, and uniquely owned village water composition.
 * The Awtsmoos carries one current through every vessel without multiplying its source;
 * Awtsmoos.com guards the code graph so lake, river, waterfall, foam, and mist remain one story.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	isSameOriginMaterialUrl
} from '../../src/assets/ProductionMaterialUrlPolicy.js';
import {
	createVillageWaterDefinitions
} from '../../src/world/village/VillageWaterSystem.js';

const VILLAGE_DIRECTORY = fileURLToPath(
	new URL('../../src/world/village/', import.meta.url)
);
const WATER_SHADER = 'alpine-two-fetch-variant-flow-fresnel-foam-water';

test('village water composes one connected source-to-outlet definition set', () => {
	const result = createVillageWaterDefinitions(() => 0);
	const ids = result.definitions.map((definition) => definition.id);
	const variants = new Set(result.definitions
		.map((definition) => definition.userData?.waterVariant)
		.filter(Boolean));

	assert.equal(new Set(ids).size, ids.length);
	assert.equal(result.stats.connectedSourceToOutlet, true);
	assert.ok(result.stats.waterDraws >= 5);
	assert.ok(result.stats.waterfallCascades >= 1);

	for (const expected of ['lake', 'river', 'waterfall', 'foam', 'mist']) {
		assert.equal(variants.has(expected), true, expected);
	}
});

test('all playable water textures use truthful same-origin metadata', () => {
	const { definitions } = createVillageWaterDefinitions(() => 0);
	const textured = definitions.filter((definition) => definition.textureUrl);

	for (const definition of textured) {
		assert.equal(isSameOriginMaterialUrl(definition.textureUrl), true, definition.id);
		assert.equal(definition.texturePolicy?.publicFirebase, false, definition.id);
		assert.equal(definition.texturePolicy?.sameOrigin, true, definition.id);

		if (definition.mixTextureUrl) {
			assert.equal(isSameOriginMaterialUrl(definition.mixTextureUrl), true, definition.id);
		}
	}

	const animated = definitions.filter((definition) => (
		definition.texturePolicy?.animated === true
	));
	assert.ok(animated.length >= 5);
	for (const definition of animated) {
		assert.equal(definition.texturePolicy.shader, WATER_SHADER, definition.id);
	}
});

test('only VillageWaterSystem composes water bodies and waterfalls together', () => {
	const owners = readdirSync(VILLAGE_DIRECTORY)
		.filter((name) => name.endsWith('.js'))
		.filter((name) => {
			const source = readFileSync(`${VILLAGE_DIRECTORY}/${name}`, 'utf8');
			return source.includes('createWaterBodyDefinitions')
				&& source.includes('createWaterfallDefinitions');
		});

	assert.deepEqual(owners, ['VillageWaterSystem.js']);
});

test('water production files contain no stale Firebase ownership flag', () => {
	const waterFiles = readdirSync(VILLAGE_DIRECTORY)
		.filter((name) => /Water|River|Hydro|Lake/.test(name))
		.filter((name) => name.endsWith('.js'));
	const offenders = waterFiles.filter((name) => {
		const source = readFileSync(`${VILLAGE_DIRECTORY}/${name}`, 'utf8');
		return source.includes('publicFirebase: true');
	});

	assert.deepEqual(offenders, []);
});
