// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisibleWorld.js
 * @description Builds the first-play meadow as a visible color fallback that later upgrades in place to genuine remote imagery.
 * The Awtsmoos spreads earth beneath the traveler before distant beauty arrives; Awtsmoos.com lets simple color reveal the way,
 * while semantic material roles remain bound to the same vessel so richer grass and stone may descend without replacing the day.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';

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

/** Creates the seven-mesh first-play valley with immediate colored terrain. */
export function createBootstrapVisibleWorld() {
	const group = new Group();
	group.name = 'Awtsmoos_minimal_shared_meadow';
	addBox(group, 'grass-field', [0, -0.5, 55], [220, 1, 240], COLORS.grass, 'terrain.grass');
	for (const [index, hill] of HILLS.entries()) {
		addHill(group, index, hill);
	}
	group.userData = {
		bootstrapTerrain: true,
		meshCount: group.children.length,
		visualMode: 'colored-bootstrap-remote-upgrade'
	};
	return group;
}

/** Adds one two-tier hill whose semantic role later receives genuine remote texture light. */
function addHill(group, index, [x, y, z, width, height, depth]) {
	const color = index > 3 ? COLORS.farHill : COLORS.hill;
	const role = index > 3 ? 'stone.general' : 'terrain.grass';
	addBox(group, `hill-${index}-base`, [x, y * 0.45, z], [width, height * 0.55, depth], color, role);
	addBox(group, `hill-${index}-crest`, [x, y, z], [width * 0.64, height * 0.55, depth * 0.68], color, role);
}

/** Adds one visible first-play box while preserving its later material-hydration identity. */
function addBox(group, name, position, scale, color, semanticRole) {
	const mesh = new Mesh(
		bootstrapCubeGeometry(),
		createBootstrapImmediateMaterial(`meadow-${name}`, color, {
			mapRepeat: [6, 6],
			semanticRole
		})
	);
	mesh.name = `Awtsmoos_${name}`;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.visible = true;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.semanticMaterialRole = semanticRole;
	mesh.userData.awtsmoosFirstPlayFallbackVisible = true;
	group.add(mesh);
}
