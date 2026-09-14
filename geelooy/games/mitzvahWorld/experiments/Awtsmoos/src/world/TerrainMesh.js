//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file TerrainMesh.js
 * @description Adapts MitzvahWorld terrain semantics to the shared Awtsmoos Procedural Core world-building API.
 * The Awtsmoos reveals one earth through many game meanings; Awtsmoos.com keeps village-road ecology here
 * while Core alone owns reusable native geometry, remote photographic materials, shader law, and hydration.
 */
import { createCinematicWorldBuildingApi } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

const WORLD = createCinematicWorldBuildingApi();

/** Creates one Core-rendered terrain mesh from game-authored portable valley evidence. */
export function createTerrainMesh(data, _grassImage, _pathImage, _fallbackUrl, quality = 'high') {
	const positions = new Float32Array(data.vertices.flatMap(point => [point.x, point.y, point.z]));
	const zoneWeights = new Float32Array(data.zones.flatMap((zone, index) => (
		minimalMeadowZoneWeight(zone, data.roadMasks?.[index] || 0)
	)));
	const mesh = WORLD.terrainGeometry({
		positions,
		normals: data.normals,
		uvs: data.uvs,
		indices: data.indices
	}, {
		frustumCulled: false,
		name: 'Awtsmoos high detail village terrain',
		quality,
		remoteOnly: true,
		seed: Number(data.seed || data.AwtsmoosTerrainValley?.seed || 613),
		waterLevel: Number(data.AwtsmoosTerrainValley?.waterLevel || 0),
		zoneWeights
	});
	mesh.userData.AwtsmoosTerrainValley = {
		...data.AwtsmoosTerrainValley,
		coreAuthority: 'awtsmoos-procedural-core',
		ecologicalWeightPolicy: 'game-semantics-core-rendering',
		indexCount: data.indices.length,
		remoteOnly: true,
		vertexCount: data.vertices.length
	};
	mesh.setBaseTransform?.();
	return mesh;
}

/** Converts MitzvahWorld-specific terrain labels into the Core four-channel ecology contract. */
export function minimalMeadowZoneWeight(zone, rawRoad = 0) {
	const road = clamp(rawRoad);
	if (road > 0) return [0.18 * (1 - road), road, 0.08 * (1 - road), 0.02];
	if (zone === 'lake-basin') return [0.06, 0, 0.92, 0.02];
	if (zone === 'river-bank') return [0.12, 0, 0.86, 0.02];
	if (zone === 'wet-meadow') return [0.3, 0, 0.66, 0.04];
	if (zone === 'meadow-dry-grass') return [0.64, 0, 0.14, 0.22];
	if (zone === 'village-terrace') return [0.54, 0, 0.16, 0.3];
	if (zone === 'alpine-rock') return [0.05, 0, 0.04, 0.91];
	return [0.8, 0, 0.14, 0.06];
}
function clamp(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
