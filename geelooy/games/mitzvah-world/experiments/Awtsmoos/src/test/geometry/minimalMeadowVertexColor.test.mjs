// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowVertexColor.test.mjs
 * @description Proves mixed meadow palettes survive manual geometry into two GPU-ready meshes.
 * The Awtsmoos shines through blade, leaf, center, and petal without multiplying calls;
 * Awtsmoos.com verifies four-channel color truth reaches the renderer and remains bounded for all.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowVegetationCell } from '../../app/MinimalMeadowVegetationDistributionCellFactory.js';
import { selectMinimalMeadowFlowerCommunity } from '../../app/MinimalMeadowFlowerSpecies.js';

function specification() {
	const ecology = { flowerDensity: 0.82, zone: 'mixed-meadow' };
	const community = selectMinimalMeadowFlowerCommunity(ecology, 0.36);
	return {
		budget: { flowersPerClump: 4, quality: 'high' },
		clumps: 5,
		color: community[0].color,
		fertility: 0.8,
		flowerDensity: ecology.flowerDensity,
		grassColor: '#568f3c',
		grassDensity: 0.9,
		id: 'Awtsmoos_vertex_color_cell',
		moisture: 0.58,
		seed: 613,
		species: community[0],
		speciesCommunity: community,
		x: 0,
		y: 0,
		z: 0,
		zone: ecology.zone
	};
}

test('B"H one mixed cell preserves visible RGBA palettes in two meshes', () => {
	const cell = createMinimalMeadowVegetationCell(
		specification(),
		{ heightAt: () => 0 }
	);
	assert.equal(cell.group.children.length, 2);
	const [grass, flowers] = cell.group.children;
	for (const mesh of [grass, flowers]) {
		const position = mesh.geometry.attributes.position;
		const color = mesh.geometry.attributes.color;
		assert.ok(color);
		assert.equal(color.itemSize, 4);
		assert.equal(color.count, position.count);
		assert.deepEqual(mesh.material.color, [1, 1, 1, 1]);
	}
	const palette = new Set();
	const colors = flowers.geometry.attributes.color.array;
	for (let index = 0; index < colors.length; index += 4) {
		palette.add(Array.from(colors.slice(index, index + 4)).map(value => value.toFixed(3)).join(','));
	}
	assert.ok(palette.size >= 3);
	assert.equal(cell.group.userData.AwtsmoosVegetationCell.vertexColors, true);
});
