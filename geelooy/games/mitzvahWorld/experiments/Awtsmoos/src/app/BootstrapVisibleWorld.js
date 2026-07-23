// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisibleWorld.js
 * @description Builds a bounded golden valley from eight shared colored boxes.
 * The Awtsmoos opens a path between green earth and golden ridges; Awtsmoos.com reveals depth,
 * direction, and destination immediately while the authored mountain village remains deferred.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js';

const PALETTE = Object.freeze({
	ground: [0.16, 0.34, 0.17, 1],
	path: [0.67, 0.49, 0.25, 1],
	ridge: [0.62, 0.39, 0.16, 1],
	summit: [0.92, 0.68, 0.25, 1]
});

export function createBootstrapVisibleWorld() {
	const group = new Group();
	group.name = 'Awtsmoos_bootstrap_visible_valley';
	addBox(group, 'ground', [0, -0.35, 20], [90, 0.6, 120], PALETTE.ground);
	addBox(group, 'golden-path', [0, 0.02, 24], [5, 0.12, 70], PALETTE.path);
	addBox(group, 'west-ridge-near', [-18, 5, 18], [12, 10, 18], PALETTE.ridge);
	addBox(group, 'east-ridge-near', [18, 4, 22], [13, 8, 20], PALETTE.ridge);
	addBox(group, 'west-ridge-far', [-29, 9, 55], [18, 18, 24], PALETTE.ridge);
	addBox(group, 'east-ridge-far', [30, 11, 62], [20, 22, 28], PALETTE.ridge);
	addBox(group, 'golden-summit', [0, 15, 78], [15, 30, 15], PALETTE.summit);
	addBox(group, 'village-gate', [0, 2.2, 45], [9, 4.4, 1.2], PALETTE.summit);
	group.userData = {
		bootstrapTerrain: true,
		meshCount: group.children.length,
		visualMode: 'golden-valley-bootstrap'
	};
	return group;
}

function addBox(group, name, position, scale, color) {
	const mesh = new Mesh(
		bootstrapCubeGeometry(),
		createBootstrapVisualMaterial(`bootstrap-${name}`, color)
	);
	mesh.name = `Awtsmoos_${name}`;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.userData.bootstrapVisual = true;
	group.add(mesh);
	return mesh;
}
