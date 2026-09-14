//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ProceduralSkyMeshFactory.js
 * @description Keeps a legacy portable-geometry doorway while Procedural Core owns atmosphere material and native mesh construction.
 * Procedural atmosphere remains permitted because it models dynamic physical light rather than fabricating replacement material imagery;
 * MitzvahWorld therefore carries compatibility identity only, while renderer-facing geometry and shader-selection policy stay in Core.
 */
import {
	createNativeGeometryMesh,
	createNativeWorldMaterial
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

export const PROCEDURAL_SKY_VISUAL_VERSION = 'procedural-daylight-sky-01';

/**
 * Materialize legacy indexed atmosphere geometry through Core's native rendering boundary.
 * @param {string} name Stable scene identity retained for old callers.
 * @param {object} geometryData Portable indexed positions, normals, UVs, and indices.
 * @returns {object} Core-created camera-surrounding procedural atmosphere mesh.
 */
export function createProceduralSkyMesh(name, geometryData) {
	const material = createNativeWorldMaterial({
		color: [1, 1, 1, 1],
		doubleSided: true,
		name: `${name}_material`,
		remoteOnly: false,
		semanticRole: 'world-sky-atmosphere',
		texturePolicy: {
			cameraCentered: true,
			proceduralShaderAllowed: true,
			proceduralSky: true
		}
	});	const mesh = createNativeGeometryMesh(geometryData, material, {
		family: 'world-sky-atmosphere',
		frustumCulled: false,
		name
	});
	mesh.visible = true;
	mesh.userData.proceduralSky = true;
	mesh.userData.renderDistance = Infinity;
	mesh.userData.visualQualityVersion = PROCEDURAL_SKY_VISUAL_VERSION;
	return mesh;
}
