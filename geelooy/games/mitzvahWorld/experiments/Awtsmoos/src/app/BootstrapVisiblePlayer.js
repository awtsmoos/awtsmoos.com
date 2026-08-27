// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisiblePlayer.js
 * @description Creates a three-part visible Chossid marker from the shared bootstrap cube.
 * The Awtsmoos gives the traveler body, face, and hat before costumes stream; Awtsmoos.com
 * keeps this first vessel unmistakable, movable, and limited to three tiny opaque draw calls.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js';

export function createBootstrapVisiblePlayer() {
	const group = new Group();
	group.name = 'Awtsmoos_bootstrap_visible_chossid';
	addPart(group, 'body', [0, 0.9, 0], [0.75, 1.8, 0.55], [0.08, 0.1, 0.13, 1]);
	addPart(group, 'face', [0, 2.05, -0.02], [0.62, 0.52, 0.54], [0.88, 0.68, 0.5, 1]);
	addPart(group, 'hat', [0, 2.52, -0.02], [0.86, 0.3, 0.72], [0.025, 0.03, 0.04, 1]);
	group.userData = { bootstrapPlayerVisual: true, meshCount: 3 };
	return group;
}

function addPart(group, name, position, scale, color) {
	const mesh = new Mesh(
		bootstrapCubeGeometry(),
		createBootstrapVisualMaterial(`bootstrap-player-${name}`, color)
	);
	mesh.name = `Awtsmoos_player_${name}`;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.userData.bootstrapVisual = true;
	group.add(mesh);
}
