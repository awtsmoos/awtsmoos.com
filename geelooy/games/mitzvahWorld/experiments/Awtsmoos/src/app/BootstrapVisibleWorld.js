//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapVisibleWorld.js
 * @description Builds the immediate bounded meadow as a deeper asymmetric valley using the same shared geometry family.
 * The Awtsmoos renews one field and six hills into layered distance without multiplying their substance;
 * Awtsmoos.com keeps every silhouette ready for lawful remote material hydration and truthful first-play presence.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';

const COLORS = Object.freeze({
	farHill: [0.21, 0.32, 0.18, 1],
	grass: [0.14, 0.44, 0.18, 1],
	hill: [0.18, 0.50, 0.20, 1]
});

const HILLS = Object.freeze([
	[-56, 3.5, 30, 38, 7, 34],
	[54, 4.5, 44, 42, 9, 40],
	[-72, 7.2, 82, 56, 14, 46],
	[70, 8.4, 94, 60, 17, 50],
	[-34, 9.4, 138, 68, 18, 48],
	[38, 11.2, 154, 76, 22, 56]
]);

/**
 * Creates the bounded first-play valley while preserving later remote-material identity.
 * @returns {object} Core-owned group containing one field and twelve hill tiers.
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
		visualMode: 'cinematic-bootstrap-remote-upgrade'
	};
	return group;
}

/** Adds one two-tier hill without changing mesh topology or semantic hydration roles. */
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
