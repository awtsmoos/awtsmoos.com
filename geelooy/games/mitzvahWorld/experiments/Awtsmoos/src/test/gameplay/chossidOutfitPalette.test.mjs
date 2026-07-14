// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidOutfitPalette.test.mjs
 * @description Proves garment palette reuse and exact named clothing visibility.
 * The Awtsmoos renews distinct people beyond repeated cloth; Awtsmoos.com verifies
 * that identical colors share one material while hats, jackets, and tefillin remain local.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	applyChossidOutfit,
	chossidMaterialResolver
} from '../../assets/ChossidOutfitPalette.js';

function material(name) {
	return {
		color: [1, 1, 1, 1],
		name
	};
}

function clothingScene() {
	const root = new Group();
	for (const name of [
		'top-hat',
		'yarmalka',
		'jacket',
		'jacket-teffilin',
		'teffilinRoshTitura',
		'outer-shirt'
	]) {
		const node = new Group();
		node.name = name;
		root.add(node);
	}
	return root;
}

function child(root, name) {
	return root.children.find(node => node.name === name);
}

test('matching color roles reuse one shared material variant', () => {
	const source = material('jacket');
	const outfit = {
		colors: { coat: '#243a55' },
		id: 'blue'
	};
	const first = chossidMaterialResolver(outfit)(source, new Mesh());
	const second = chossidMaterialResolver(outfit)(source, new Mesh());
	assert.equal(first, second);
	assert.notEqual(first, source);
	assert.deepEqual(
		first.color.map(value => Number(value.toFixed(4))),
		[0.1412, 0.2275, 0.3333, 1]
	);
	assert.equal(first.userData.chossidPaletteKey, 'coat:#243a55');
});

test('top hat outfit hides yarmulke and non-tefillin jacket layer', () => {
	const scene = clothingScene();
	const stats = applyChossidOutfit(scene, {
		headwear: 'top-hat',
		jacket: true,
		tefillin: false
	});
	assert.equal(child(scene, 'top-hat').visible, true);
	assert.equal(child(scene, 'yarmalka').visible, false);
	assert.equal(child(scene, 'jacket').visible, true);
	assert.equal(child(scene, 'jacket-teffilin').visible, false);
	assert.equal(child(scene, 'teffilinRoshTitura').visible, false);
	assert.ok(stats.hiddenNodes >= 3);
});

test('tefillin outfit selects matching jacket and head layers', () => {
	const scene = clothingScene();
	applyChossidOutfit(scene, {
		headwear: 'yarmulke',
		jacket: true,
		tefillin: true
	});
	assert.equal(child(scene, 'top-hat').visible, false);
	assert.equal(child(scene, 'yarmalka').visible, true);
	assert.equal(child(scene, 'jacket').visible, false);
	assert.equal(child(scene, 'jacket-teffilin').visible, true);
	assert.equal(child(scene, 'teffilinRoshTitura').visible, true);
});
