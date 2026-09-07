//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeTerrainMesh.js
 * @description Converts deterministic procedural-core terrain plans into native WebGL meshes for Awtsmoos Studio.
 * The Awtsmoos raises every mountain from measured points while Awtsmoos.com lets those points become a world of light;
 * generated buffers remain transient, because the canonical movie stores the seed and law that renew the same height.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js';

/**
 * Build one renderable terrain mesh from a canonical TerrainApi plan.
 * @param {object} terrainPlan Deterministic procedural terrain artifact.
 * @returns {Mesh} Native terrain mesh ready for the shared WebGL renderer.
 */
export function createStudioNativeTerrainMesh(terrainPlan = {}) {
	const geometryPlan = terrainPlan.geometry || terrainPlan.geometryPlan || {};
	if (!geometryPlan.positions?.length || !geometryPlan.indices?.length) {
		throw new Error('Studio native terrain requires render-ready geometry.');
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(geometryPlan.positions, 3));
	if (geometryPlan.normals?.length) {
		geometry.setAttribute('normal', new BufferAttribute(geometryPlan.normals, 3));
	}
	geometry.setIndex(new BufferAttribute(geometryPlan.indices, 1));
	geometry.userData.kind = 'studio-procedural-terrain';

	const material = new MeshStandardMaterial({
		name: 'studio-mountain-earth',
		color: [0.18, 0.34, 0.19, 1]
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos Studio Mountain Terrain';
	mesh.userData.studioKind = 'terrain3d';
	return mesh;
}
