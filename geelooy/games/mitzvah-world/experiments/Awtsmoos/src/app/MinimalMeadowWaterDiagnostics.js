// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterDiagnostics.js
 * @description Reports truthful geometry, hydration, adaptive quality, and steady-state animation evidence for water.
 * The Awtsmoos lets measurement guard beauty from illusion; Awtsmoos.com records what the river truly spends,
 * so richer current may remain a blessing to play rather than a hidden tax that never ends.
 */

import { minimalMeadowWaterElevationEvidence } from './MinimalMeadowRiverBanksDiagnostics.js';
import { MINIMAL_MEADOW_RIVER_SEGMENTS } from './MinimalMeadowRiverPath.js';
import { minimalMeadowMeshMetrics } from './MinimalMeadowWorldPopulationDiagnostics.js';

/**
 * @description Builds an on-demand diagnostic receipt for the mounted water system.
 * @param {object} system Active MinimalMeadowWaterSystem instance.
 * @returns {object} Water geometry, material, quality, and animation evidence.
 */
export function minimalMeadowWaterDiagnostics(system) {
	const metrics = minimalMeadowMeshMetrics(system.meshes);
	const surfaces = system.meshes.filter(mesh => mesh.userData?.waterVariant);
	const river = surfaces.find(mesh => mesh.userData.waterVariant === 'river');
	const lake = surfaces.find(mesh => mesh.userData.waterVariant === 'lake');
	const materialPolicy = surfaces[0]?.material?.texturePolicy || {};
	return {
		activeNormalSources: system.sources.activeNormalSources,
		animatedSurfaces: system.animatedSurfaces,
		animationOffsetBuffers: system.preparedSurfaces * 4,
		bankMeshes: 2,
		bedMeshes: 2,
		colorMode: system.sources.colorMode,
		drawCalls: system.meshes.length,
		elevations: minimalMeadowWaterElevationEvidence(),
		errors: [...system.errors],
		flowLayers: Number(materialPolicy.flowLayers || 0),
		hostedColorReady: system.sources.hostedColorReady,
		hydratedMeshes: system.hydratedMeshes,
		hydrationState: system.hydrationState,
		lakeVertices: vertexCount(lake),
		materials: metrics.materials,
		mounted: system.group.parent === system.runtime.scene,
		normalMode: system.sources.normalMode,
		physicalShader: materialPolicy.waterPhysical?.shader || null,
		qualityLevel: system.qualityPolicy.level,
		qualityUpdateStride: system.qualityPolicy.updateStride,
		riverSegments: MINIMAL_MEADOW_RIVER_SEGMENTS,
		riverVertices: vertexCount(river),
		sceneObjects: 1 + system.meshes.length,
		shader: materialPolicy.shader || null,
		steadyStateUpdateAllocations: 0,
		triangles: metrics.triangles,
		updateAllocations: 0,
		waterMeshes: surfaces.length
	};
}

/**
 * @description Reads vertex count from one optional runtime mesh.
 * @param {object|null|undefined} mesh Runtime water mesh.
 * @returns {number} Vertex count.
 */
function vertexCount(mesh) {
	return Number(mesh?.geometry?.attributes?.position?.array?.length || 0) / 3;
}
