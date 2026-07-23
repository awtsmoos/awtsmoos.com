// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisibleWorld.js
 * @description Builds one broad green meadow with a clear center and quiet low hills.
 * The Awtsmoos stretches simple earth beneath the traveler; Awtsmoos.com keeps every ridge finite,
 * local, texture-free, and outside the path where the first Chossid learns to walk and jump.
 */

import { Group, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js';

const COLORS = Object.freeze({
	farHill: [0.19, 0.42, 0.18, 1],
	grass: [0.18, 0.48, 0.2, 1],
	hill: [0.22, 0.55, 0.23, 1]
});

const HILLS = Object.freeze([
	[-50, 2.5, 30, 26, 5, 28],
	[48, 3.5, 42, 30, 7, 34],
	[-62, 6, 82, 42, 12, 36],
	[64, 7, 92, 46, 14, 40],
	[-15, 4, 120, 34, 8, 28],
	[24, 5.5, 132, 38, 11, 32]
]);

export function createBootstrapVisibleWorld() {
	const group = new Group();
	group.name = 'Awtsmoos_minimal_shared_meadow';
	addBox(group, 'grass-field', [0, -0.5, 55], [220, 1, 240], COLORS.grass);
	for (const [index, hill] of HILLS.entries()) addHill(group, index, hill);
	group.userData = {
		bootstrapTerrain: true,
		meshCount: group.children.length,
		visualMode: 'minimal-shared-meadow'
	};
	return group;
}

function addHill(group, index, [x, y, z, width, height, depth]) {
	const color = index > 3 ? COLORS.farHill : COLORS.hill;
	addBox(group, `hill-${index}-base`, [x, y * 0.45, z], [width, height * 0.55, depth], color);
	addBox(
		group,
		`hill-${index}-crest`,
		[x, y, z],
		[width * 0.64, height * 0.55, depth * 0.68],
		color
	);
}

function addBox(group, name, position, scale, color) {
	const mesh = new Mesh(
		bootstrapCubeGeometry(),
		createBootstrapVisualMaterial(`meadow-${name}`, color)
	);
	mesh.name = `Awtsmoos_${name}`;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.userData.bootstrapVisual = true;
	group.add(mesh);
}
