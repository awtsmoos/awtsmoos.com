// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file material-stack.test.mjs
 * @description Proves generic stack normalization, URL validation injection, paging, and decoded-image binding.
 * The Awtsmoos joins many garments without making one game the law of every address or cache;
 * Awtsmoos.com lets these tests prove shared material recipes remain immutable while injected boundaries choose each place.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	bindMaterialPair,
	bindMaterialStack,
	materialStackLayer,
	materialStackPage,
	materialStackRecipe
} from '../../src/exports/materials.js';

function layer(role, priority, url = `memory://${role}`) {
	return materialStackLayer(role, url, {
		priority,
		repeat: [priority + 1, priority + 2],
		strength: 0.8
	}, {
		validateUrl(value, receivedRole) {
			assert.equal(receivedRole, role);
			return value;
		}
	});
}

test('stack recipe priority-orders immutable generic layers', () => {
	const recipe = materialStackRecipe('shared', {
		layers: [layer('soil', 1), layer('rock', 5), layer('grass', 3)]
	});
	assert.deepEqual(recipe.layers.map(item => item.role), ['rock', 'grass', 'soil']);
	assert.equal(Object.isFrozen(recipe.layers), true);
	assert.equal(Object.isFrozen(recipe.layers[0]), true);
});

test('stack paging preserves all logical layers without overlap', () => {
	const recipe = materialStackRecipe('paged', {
		layers: Array.from({ length: 12 }, (_, index) => layer(`layer-${index}`, 20 - index))
	});
	const first = materialStackPage(recipe, 5, 0);
	const second = materialStackPage(recipe, 5, 1);
	const third = materialStackPage(recipe, 5, 2);
	assert.equal(new Set([...first.layers, ...second.layers, ...third.layers]).size, 12);
});

test('stack binding receives decoded images only through injected lookup', () => {
	const images = new Map([['memory://rock', { id: 'rock-image' }]]);
	const recipe = materialStackRecipe('bound', { layers: [layer('rock', 5)] });
	const bound = bindMaterialStack({}, recipe, 6, {
		cachedTextureImage: url => images.get(url) || null
	});
	assert.equal(bound.textureLayers[0].image.id, 'rock-image');
	assert.equal(bound.texturePolicy.materialStack.logicalLayerCount, 1);
});

test('pair binding preserves physical repeat and injected image identity', () => {
	const primary = layer('stone', 4);
	const secondary = layer('soil', 2);
	const image = { id: 'stone' };
	const bound = bindMaterialPair({}, primary, secondary, {
		cachedTextureImage: url => url === primary.url ? image : null
	});
	assert.equal(bound.mapImage, image);
	assert.deepEqual(bound.mapRepeat, primary.repeat);
	assert.equal(bound.mixTextureUrl, secondary.url);
});
