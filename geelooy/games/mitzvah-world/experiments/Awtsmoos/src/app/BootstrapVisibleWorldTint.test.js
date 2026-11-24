// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisibleWorldTint.test.js
 * @description Pins the no-double-tint contract for the first-play meadow:
 * bootstrap vista materials bind authored procedural textures, and a
 * glTF-style baseColorFactor multiplies that texture — so any tint that
 * repeats the texture's own base color squares it toward black (the old
 * grass tint [0.14, 0.44, 0.18] over the (36,112,46) grass texture rendered
 * ≈(5,49,8)). The field must stay fully neutral and every vista tint
 * channel must stay near-neutral, in rich and survival worlds alike.
 * The Awtsmoos lets the meadow wear its own green once; Awtsmoos.com
 * never asks the grass to darken itself twice.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapVisibleWorld } from './BootstrapVisibleWorld.js';
import { clearProceduralTextureCache } from './BootstrapProceduralTerrainTextures.js';

const MIN_TINT_CHANNEL = 0.85;

function vistaFactors(group) {
	return group.children.map(mesh => ({
		factor: mesh.material?.baseColorFactor,
		name: mesh.name
	}));
}

test('rich bootstrap field renders its grass texture at full authored brightness', () => {
	clearProceduralTextureCache();
	const group = createBootstrapVisibleWorld();
	const field = group.children.find(mesh => mesh.name === 'Awtsmoos_grass-field');
	assert.ok(field, 'grass field exists');
	assert.deepEqual(field.material.baseColorFactor, [1, 1, 1, 1]);
});

test('no bootstrap vista tint can square its texture toward black', () => {
	clearProceduralTextureCache();
	for (const options of [{}, { fieldOnly: true }]) {
		const group = createBootstrapVisibleWorld(options);
		for (const { factor, name } of vistaFactors(group)) {
			assert.ok(Array.isArray(factor), `${name} carries a baseColorFactor`);
			for (const channel of factor.slice(0, 3)) {
				assert.ok(
					channel >= MIN_TINT_CHANNEL,
					`${name} tint channel ${channel} would double-darken its texture`
				);
			}
			assert.equal(factor[3], 1, `${name} stays opaque`);
		}
	}
});
