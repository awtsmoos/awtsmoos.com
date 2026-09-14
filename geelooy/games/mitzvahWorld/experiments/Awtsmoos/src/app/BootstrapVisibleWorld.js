//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapVisibleWorld.js
 * @description Builds the immediate meadow fallback while Procedural Core owns native hierarchy and meshes.
 * MitzvahWorld retains only first-play semantic placement, scale, fallback visibility, and material roles;
 * the same shared cube can later hydrate with real remote imagery without replacing gameplay state or
 * duplicating reusable renderer construction inside this product-specific bootstrap layer.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
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

/**
 * Creates the bounded first-play valley while preserving later remote-material identity.
 * @returns {object} Core-owned group containing the bootstrap field and hill silhouettes.
 */
export function createBootstrapVisibleWorld() {
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_minimal_shared_meadow'
	});
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

/**
 * Adds one two-tier hill using semantic material roles that the shared hydrator understands.
 * @returns {void}
 */
function addHill(group, index, [x, y, z, width, height, depth]) {
	const color = index > 3 ? COLORS.farHill : COLORS.hill;
	const role = index > 3 ? 'stone.general' : 'terrain.grass';
	addBox(group, `hill-${index}-base`, [x, y * 0.45, z], [width, height * 0.55, depth], color, role);
	addBox(group, `hill-${index}-crest`, [x, y, z], [width * 0.64, height * 0.55, depth * 0.68], color, role);
}

/**
 * Adds one first-play box through Core while retaining the explicit fallback-visible exception.
 * @param {object} group Parent hierarchy.
 * @param {string} name Stable part name.
 * @param {number[]} position Local XYZ translation.
 * @param {number[]} scale Local XYZ scale.
 * @param {number[]} color Bootstrap color factor.
 * @param {string} semanticRole Later remote-material role.
 * @returns {void}
 */
function addBox(group, name, position, scale, color, semanticRole) {
	const material = createBootstrapImmediateMaterial(`meadow-${name}`, color, {
		mapRepeat: [6, 6],
		semanticRole
	});
	const mesh = createNativeMeshFromGeometry(bootstrapCubeGeometry(), material, {
		name: `Awtsmoos_${name}`,
		userData: {
			awtsmoosFirstPlayFallbackVisible: true,
			bootstrapVisual: true,
			semanticMaterialRole: semanticRole
		}
	});
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.visible = true;
	group.add(mesh);
}
