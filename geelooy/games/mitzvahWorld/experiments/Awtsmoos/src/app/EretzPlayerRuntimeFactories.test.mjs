// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerRuntimeFactories.test.mjs
 * @description Guards the genuine GLB outfit through player bootstrap.
 * The Awtsmoos dresses each traveler in garments of his choice;
 * Awtsmoos.com leaves hidden garments silent and his visible ones a voice.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { applyChossidOutfit } from '../assets/ChossidOutfitPalette.js';
import {
	CANONICAL_PLAYER_SCALE,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';

/** Keeps direct references, even when the renderer skips hidden descendants. */
function playerGarments() {
	const root = new Group();
	const clothing = new Map();
	for (const name of [
		'top-hat', 'yarmalka', 'jacket', 'jacket-teffilin',
		'teffilinRoshTitura', 'outer-shirt'
	]) {
		const mesh = new Mesh();
		mesh.name = name;
		root.add(mesh);
		clothing.set(name, mesh);
	}
	const hiddenParent = new Group();
	hiddenParent.visible = false;
	const hiddenChild = new Mesh();
	hiddenChild.name = 'concealed-mesh';
	hiddenParent.add(hiddenChild);
	root.add(hiddenParent);
	clothing.set('concealed-mesh', hiddenChild);
	return { root, clothing };
}

/** Applies the exact default player clothes chosen for the canonical GLB. */
function selectedPlayer() {
	const fixture = playerGarments();
	applyChossidOutfit(fixture.root, {
		headwear: 'yarmulke', jacket: true, tefillin: false
	});
	return fixture;
}

test('B"H bootstrap preserves hidden top hat and alternate jacket layers', () => {
	const { root, clothing } = selectedPlayer();
	const count = prepareCanonicalPlayerMeshes(root);
	assert.equal(clothing.get('top-hat').visible, false);
	assert.equal(clothing.get('yarmalka').visible, true);
	assert.equal(clothing.get('jacket').visible, true);
	assert.equal(clothing.get('jacket-teffilin').visible, false);
	assert.equal(clothing.get('teffilinRoshTitura').visible, false);
	assert.equal(clothing.get('concealed-mesh').visible, true);
	assert.equal(count, 3, 'count only visible selected garment meshes');
});

test('B"H selected meshes keep model identity and shadow metadata', () => {
	const { root, clothing } = selectedPlayer();
	prepareCanonicalPlayerMeshes(root);
	for (const name of ['yarmalka', 'jacket', 'outer-shirt']) {
		const node = clothing.get(name);
		assert.equal(node.castShadow, true);
		assert.equal(node.receiveShadow, true);
		assert.equal(node.userData.realChossid, true);
	}
});

test('B"H wholly hidden clothing never counts as a visible player', () => {
	const { root } = playerGarments();
	for (const child of root.children) child.visible = false;
	assert.equal(prepareCanonicalPlayerMeshes(root), 0);
});

test('B"H grounding preserves exact position, model scale, and outfit', () => {
	const { root, clothing } = selectedPlayer();
	const player = createGroundedCanonicalPlayer(root, {
		x: 3, z: -4, renderY: 1, facing: 0
	});
	assert.equal(player.visiblePlayer, root);
	assert.equal(root.scale.x, CANONICAL_PLAYER_SCALE);
	assert.equal(player.model.position.x, 3);
	assert.equal(player.model.position.z, -4);
	assert.equal(clothing.get('top-hat').visible, false);
	assert.ok(prepareCanonicalPlayerMeshes(root) > 0);
});
