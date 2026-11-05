// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackRecipe.test.mjs
 * @description Proves sixteen logical layers page deterministically into ten active samplers.
 * The Awtsmoos is whole beyond every page; Awtsmoos.com preserves complete surface intention
 * while finite GPUs reveal highest-priority garments through one trusted material resolver.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fullMaterialUrl } from '../../assets/PublicMaterialResolver.js';
import { materialStackLayer } from '../../world/materials/MaterialStackLayer.js';
import {
	materialStackDiagnostics,
	materialStackPage,
	materialStackRecipe
} from '../../world/materials/MaterialStackRecipe.js';

test('sixteen logical layers remain immutable and priority ordered', () => {
	const recipe = materialStackRecipe('test-stack', {
		layers: Array.from({ length: 20 }, (_, index) => layer(index))
	});
	assert.equal(recipe.layers.length, 16);
	assert.equal(recipe.logicalLayerCount, 16);
	assert.equal(recipe.targetActiveLayers, 10);
	assert.equal(recipe.layers[0].priority, 19);
	assert.equal(recipe.layers.at(-1).priority, 4);
	assert.equal(Object.isFrozen(recipe.layers), true);
});

test('ten-layer pages preserve every logical layer without overlap', () => {
	const recipe = materialStackRecipe('paged', {
		layers: Array.from({ length: 16 }, (_, index) => layer(index))
	});
	const first = materialStackPage(recipe, 10, 0);
	const second = materialStackPage(recipe, 10, 1);
	assert.equal(first.layers.length, 10);
	assert.equal(second.layers.length, 6);
	assert.equal(first.pageCount, 2);
	assert.equal(new Set([...first.layers, ...second.layers]).size, 16);
});

test('diagnostics report active and logical capacity honestly', () => {
	const recipe = materialStackRecipe('diagnostic', {
		layers: [layer(1), layer(2)]
	});
	assert.deepEqual(materialStackDiagnostics(recipe, 10), {
		activeCapacity: 10,
		activeLayerCount: 2,
		logicalLayerCount: 2,
		pageCount: 1,
		recipe: 'diagnostic'
	});
});

function layer(index) {
	return materialStackLayer(
		`layer-${index}`,
		fullMaterialUrl(`layer-${index}`),
		{ priority: index, repeat: [index + 1, index + 1] }
	);
}
