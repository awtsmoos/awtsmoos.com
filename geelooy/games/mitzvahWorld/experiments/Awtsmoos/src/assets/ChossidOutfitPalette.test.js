// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidOutfitPalette.test.mjs
 * @description Guards the canonical player outfit wiring: the player GLB load must
 * receive the same material resolver NPCs get, authored orange skin must refine to
 * a natural tone, pure-black garments must lift to separated near-blacks, and the
 * outfit visibility law must leave the player in yarmulke + jacket without tefillin.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	applyChossidOutfit,
	chossidMaterialResolver,
	playerChossidOutfit
} from './ChossidOutfitPalette.js';

const APP_URL = new URL('../app/', import.meta.url);

function fakeMaterial(name, color) {
	return { color: [...color], name, userData: {} };
}

test('player outfit is the canonical yarmulke + jacket identity', () => {
	const outfit = playerChossidOutfit();
	assert.equal(outfit.id, 'player-canonical');
	assert.equal(outfit.headwear, 'yarmulke');
	assert.equal(outfit.jacket, true);
	assert.equal(outfit.tefillin, false);
	assert.notEqual(outfit.colors.coat, outfit.colors.pants);
	assert.notEqual(outfit.colors.coat, '#000000');
});

test('player load path applies the same resolver NPCs get', async () => {
	const source = await readFile(new URL('EretzActorAssetLoader.js', APP_URL), 'utf8');
	const playerBlock = source.slice(
		source.indexOf("loadIsolatedGltf(PLAYER_MODEL_URL, 'player-canonical'"),
		source.indexOf("loadIsolatedGltf(PLAYER_MODEL_URL, 'player-canonical'") + 400
	);
	assert.match(playerBlock, /materialResolver:\s*palette\.chossidMaterialResolver\(palette\.playerChossidOutfit\(\)\)/);
	assert.match(source, /palette\.applyChossidOutfit\(playerGltf\.scene,\s*playerOutfit\)/);
});

test('resolver refines authored orange skin to a natural tone', () => {
	const resolver = chossidMaterialResolver(playerChossidOutfit());
	const raw = fakeMaterial('skin', [0.8, 0.6, 0.19, 1]);
	const variant = resolver(raw);
	assert.notEqual(variant, raw);
	assert.ok(variant.color[2] > 0.19, `blue lifted out of orange cast: ${variant.color}`);
	assert.ok(variant.color[0] < 0.8, `red pulled back: ${variant.color}`);
	assert.equal(variant.userData.chossidPaletteKey, 'skin:#b08a6e');
});

test('resolver lifts pure-black shoes to a separated near-black', () => {
	const resolver = chossidMaterialResolver(playerChossidOutfit());
	const variant = resolver(fakeMaterial('shoes', [0, 0, 0, 1]));
	assert.ok(variant.color[0] > 0 && variant.color[1] > 0 && variant.color[2] > 0);
	assert.notDeepEqual(
		variant.color.slice(0, 3),
		resolver(fakeMaterial('pants', [0.019, 0.019, 0.019, 1])).color.slice(0, 3),
		'shoes stay visibly separated from pants'
	);
});

test('resolver keeps palette-driven coat/pants/shirt colors and shares variants', () => {
	const outfit = playerChossidOutfit();
	const resolver = chossidMaterialResolver(outfit);
	const source = fakeMaterial('jacket', [0, 0, 0, 1]);
	const coat = resolver(source);
	assert.deepEqual(coat.color.slice(0, 3), [0x23 / 255, 0x25 / 255, 0x2b / 255]);
	assert.equal(resolver(source), coat, 'same source material reuses its variant');
	const skinSource = fakeMaterial('skin', [0.8, 0.6, 0.19, 1]);
	assert.equal(resolver(skinSource), resolver(skinSource), 'refined skin variant shared across instances');
});

test('applyChossidOutfit leaves the player in yarmulke and jacket only', () => {
	const nodes = ['top-hat', 'yarmalka', 'jacket', 'jacket-teffilin', 'teffilinStrap', 'outer-shirt']
		.map(name => ({ name, visible: true }));
	const scene = { traverse: visit => nodes.forEach(visit), userData: {} };
	const stats = applyChossidOutfit(scene, playerChossidOutfit());
	const visibility = Object.fromEntries(nodes.map(node => [node.name, node.visible]));
	assert.equal(visibility['top-hat'], false);
	assert.equal(visibility.yarmalka, true);
	assert.equal(visibility.jacket, true);
	assert.equal(visibility['jacket-teffilin'], false);
	assert.equal(visibility.teffilinStrap, false);
	assert.equal(visibility['outer-shirt'], true);
	assert.equal(stats.hiddenNodes, 3);
	assert.equal(stats.visibleNodes, 3);
});
