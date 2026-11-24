// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisibleWorld.js
 * @description Builds either the authentic rich valley or survival's single textured first-control field.
 * The Awtsmoos grants each hill its future without demanding its weight at the first step;
 * Awtsmoos.com reveals one shared meadow in survival while richer light remains lovingly kept.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { bootstrapFrustumGeometry } from './BootstrapFrustumGeometry.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';
import { getProceduralTexture } from './BootstrapProceduralTerrainTextures.js';

// Material tints multiply the bound procedural texture (glTF baseColorFactor
// convention — the same convention the promoted terrain honors with its
// neutral [1,1,1,1] tint). The previous values repeated the grass texture's
// own authored base color (36,112,46) in 0–1 form, so the field rendered
// that color squared — ≈(5,49,8), a near-black first-play meadow under a
// bright sky. Tints therefore stay near-neutral: the field is fully neutral
// so the authored grass renders at true brightness, hills sit slightly deep
// for silhouette separation, and far hills go faintly cool for aerial
// perspective. BootstrapVisibleWorldTint.test.js pins this contract.
const COLORS = Object.freeze({
	farHill: [0.97, 0.99, 1.0, 1],
	grass: [1, 1, 1, 1],
	hill: [0.88, 0.94, 0.87, 1]
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
 * Creates the first-play field, optionally leaving all ornamental hills and stone texture unallocated.
 * @param {object} [options={}] Optional textureSeed and explicit fieldOnly survival contract.
 * @returns {object} Core-owned group with one essential field or the original thirteen meshes.
 */
export function createBootstrapVisibleWorld(options = {}) {
	const seed = Number.isFinite(options.textureSeed) ? options.textureSeed : undefined;
	const fieldOnly = options.fieldOnly === true;
	const grass = seed === undefined ? getProceduralTexture('grass') : getProceduralTexture('grass', seed);
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_minimal_shared_meadow'
	});
	addBox(group, 'grass-field', [0, -0.5, 55], [220, 1, 240], COLORS.grass, 'terrain.grass', {
		mapImage: grass,
		mapRepeat: [28, 30]
	});
	if (!fieldOnly) {
		const stone = seed === undefined ? getProceduralTexture('stone') : getProceduralTexture('stone', seed);
		for (const [index, hill] of HILLS.entries()) {
			addHill(group, index, hill, grass, stone);
		}
	}
	group.userData = {
		bootstrapTerrain: true,
		meshCount: group.children.length,
		proceduralGroundTextures: true,
		visualMode: fieldOnly ? 'survival-single-field' : 'cinematic-bootstrap-remote-upgrade'
	};
	return group;
}

/** Adds one two-tier hill only to the unchanged rich/default authored meadow. */
function addHill(group, index, [x, y, z, width, height, depth], grass, stone) {
	const far = index > 3;
	const color = far ? COLORS.farHill : COLORS.hill;
	const role = far ? 'stone.general' : 'terrain.grass';
	const texture = far
		? { mapImage: stone, mapRepeat: [10, 10] }
		: { mapImage: grass, mapRepeat: [8, 8] };
	addFrustum(group, `hill-${index}-base`, [x, y * 0.45, z], [width, height * 0.55, depth], color, role, texture);
	addFrustum(group, `hill-${index}-crest`, [x, y, z], [width * 0.64, height * 0.55, depth * 0.68], color, role, texture);
}

/**
 * Builds one tapered mound tier from the shared frustum, mirroring addBox.
 * @param {object} group Parent hierarchy.
 * @param {string} name Stable part name.
 * @param {number[]} position XYZ.
 * @param {number[]} scale XYZ.
 * @param {number[]} color RGBA bootstrap tint.
 * @param {string} semanticRole Future authored texture role.
 * @param {object} [texture={}] Optional shared map image and tiling.
 */
function addFrustum(group, name, position, scale, color, semanticRole, texture = {}) {
	const material = createBootstrapImmediateMaterial(`meadow-${name}`, color, {
		mapImage: texture.mapImage || null,
		mapRepeat: texture.mapRepeat || [6, 6],
		semanticRole
	});
	const mesh = createNativeMeshFromGeometry(bootstrapFrustumGeometry(), material, {
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

/**
 * Builds one portable Core-owned cube with a semantic material preserved for remote hydration.
 * @param {object} group Parent hierarchy.
 * @param {string} name Stable part name.
 * @param {number[]} position XYZ.
 * @param {number[]} scale XYZ.
 * @param {number[]} color RGBA bootstrap tint.
 * @param {string} semanticRole Future authored texture role.
 * @param {object} [texture={}] Optional shared map image and tiling.
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
