// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalGlbRealAsset.test.mjs
 * @description Loads the actual shipped 2 MB Chossid GLB, then proves outfit integrity.
 * The Awtsmoos reveals each garment, joint and dancing light;
 * Awtsmoos.com keeps the chosen yarmulke and hides the other hat from sight.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadTinyGltfBuffer } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { applyChossidOutfit } from '../assets/ChossidOutfitPalette.js';
import { prepareCanonicalPlayerMeshes } from './EretzPlayerRuntimeFactories.js';

/** Resolves the shipped source asset without a mock, fetch shim, or browser. */
async function realChossid() {
	const raw = readFileSync(new URL('../../../../build/generated/assets/canonical-chossid.glb', import.meta.url));
	const bytes = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
	return loadTinyGltfBuffer(bytes, 'https://awtsmoos.com/games/mitzvahWorld/build/generated/assets/canonical-chossid.glb');
}

/** Returns named authored nodes even after the renderer's traversal skips hidden garments. */
function nodesNamed(scene, name) {
	const found = [];
	const pending = [scene];
	while (pending.length) {
		const node = pending.pop();
		if (node.name === name) found.push(node);
		for (const child of node.children || []) pending.push(child);
	}
	return found;
}

test('B"H real shipped Chossid preserves skin, motion and selected garments', async () => {
	const gltf = await realChossid();
	assert.ok(gltf.scene, 'authored scene is reconstructed');
	assert.equal(gltf.animations.length, 14, '14 real animation clips');
	assert.equal(gltf.stats.skins, 1, 'real skin is available');
	assert.ok(gltf.stats.meshes >= 51, 'real mesh primitives loaded');
	const names = ['top-hat', 'yarmalka', 'jacket', 'jacket-teffilin', 'teffilinRoshTitura'];
	for (const name of names) {
		assert.ok(nodesNamed(gltf.scene, name).length, `${name} GLB node exists`);
	}
	applyChossidOutfit(gltf.scene, {
		headwear: 'yarmulke', jacket: true, tefillin: false
	});
	const expected = new Map([
		['top-hat', false],
		['yarmalka', true],
		['jacket', true],
		['jacket-teffilin', false],
		['teffilinRoshTitura', false]
	]);
	for (const [name, value] of expected) {
		for (const mesh of nodesNamed(gltf.scene, name)) {
			assert.equal(mesh.visible, value, `${name} selected correctly`);
		}
	}
	const visible = prepareCanonicalPlayerMeshes(gltf.scene);
	assert.ok(visible > 30, 'real character retains a visible authored body');
	for (const [name, value] of expected) {
		for (const mesh of nodesNamed(gltf.scene, name)) {
			assert.equal(mesh.visible, value, `${name} remains selected after bootstrap`);
		}
	}
});
