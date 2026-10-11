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
import { getProceduralTexture } from './BootstrapProceduralTerrainTextures.js';

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
 * Procedural grass and stone textures are bound immediately (generated once, cached);
 * the remote upgrade path keeps working on top of them.
 * @param {object} [options={}] Optional { textureSeed } to reseed the procedural ground.
 * @returns {object} Core-owned group containing one field and twelve hill tiers.
 */
export function createBootstrapVisibleWorld(options = {}) {
	const seed = Number.isFinite(options.textureSeed) ? options.textureSeed : undefined;
	const grass = seed === undefined ? getProceduralTexture('grass') : getProceduralTexture('grass', seed);
	const stone = seed === undefined ? getProceduralTexture('stone') : getProceduralTexture('stone', seed);
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_minimal_shared_meadow'
	});
	addBox(group, 'grass-field', [0, -0.5, 55], [220, 1, 240], COLORS.grass, 'terrain.grass', {
		mapImage: grass,
		mapRepeat: [28, 30]
	});
	for (const [index, hill] of HILLS.entries()) {
		addHill(group, index, hill, grass, stone);
	}
	group.userData = {
		bootstrapTerrain: true,
		meshCount: group.children.length,
		proceduralGroundTextures: true,
		visualMode: 'cinematic-bootstrap-remote-upgrade'
	};
	return group;
}

/** Adds one two-tier hill without changing mesh topology or semantic hydration roles. */
function addHill(group, index, [x, y, z, width, height, depth], grass, stone) {
	const far = index > 3;
	const color = far ? COLORS.farHill : COLORS.hill;
	const role = far ? 'stone.general' : 'terrain.grass';
	const texture = far
		? { mapImage: stone, mapRepeat: [10, 10] }
		: { mapImage: grass, mapRepeat: [8, 8] };
	addBox(group, `hill-${index}-base`, [x, y * 0.45, z], [width, height * 0.55, depth], color, role, texture);
	addBox(group, `hill-${index}-crest`, [x, y, z], [width * 0.64, height * 0.55, depth * 0.68], color, role, texture);
}

/**
 * Adds one first-play box through Core while retaining the explicit fallback-visible exception.
 * @param {object} group Parent hierarchy.
 * @param {string} name Stable part name.
 * @param {number[]} position Local XYZ translation.
 * @param {number[]} scale Local XYZ scale.
 * @param {number[]} color Bootstrap color factor.
 * @param {string} semanticRole Later remote-material role.
 * @param {object} [texture={}] Optional { mapImage, mapRepeat } bound immediately.
 * @returns {void}
 */
function addBox(group, name, position, scale, color, semanticRole, texture = {}) {
	const material = createBootstrapImmediateMaterial(`meadow-${name}`, color, {
		mapImage: texture.mapImage || null,
		mapRepeat: texture.mapRepeat || [6, 6],
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
