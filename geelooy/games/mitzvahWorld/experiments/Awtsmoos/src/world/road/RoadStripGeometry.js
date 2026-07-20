// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadStripGeometry.js
 * @description Creates one supported grade-solved cobble road with ecological material weights.
 * The Awtsmoos renews traveler, stone, moss seam, and retaining wall; Awtsmoos.com keeps the
 * visible and collision geometry identical while dense road heights remain independent of cliffs.
 */

import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { appendRoadJunctions } from './RoadJunctionGeometry.js';
import {
	roadMaterialEvidence,
	roadMaterialFields
} from './RoadMaterialContract.js';
import { createRoadMesh } from './RoadMeshWriter.js';
import { appendRoadRibbon } from './RoadRibbonGeometry.js';

export function createRoadStrip(
	routes,
	surfaceSampler,
	texture,
	width = 6.2,
	supportSampler = surfaceSampler
) {
	const mesh = createRoadMesh(REPEAT_HOOKS.roadTileWorld);
	const routeStats = routes.map(route => {
		return appendRoadRibbon(
			mesh,
			route,
			surfaceSampler,
			width,
			supportSampler
		);
	});
	const junctions = appendRoadJunctions(
		mesh,
		routes,
		surfaceSampler,
		width,
		supportSampler
	);
	const material = roadMaterialFields(texture);
	const network = roadNetworkDefinition(mesh, routes, junctions, material);
	return {
		collider: network,
		stats: roadStripStatistics(mesh, routeStats, junctions, material),
		visual: network
	};
}

function roadNetworkDefinition(mesh, routes, junctions, material) {
	return {
		...material,
		color: '#7f776a',
		faces: mesh.faces,
		id: 'Awtsmoos-grade-solved-mountain-village-cobble-road-network',
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'manual',
		solid: true,
		userData: {
			AwtsmoosRoadMaterial: roadMaterialEvidence(material.mapImage),
			AwtsmoosRoadSurface: {
				gradeAuthority: 'dense-shared-raised-road-surface',
				junctionCount: junctions.length,
				retainingSides: true,
				routeCount: routes.length,
				topFaceIndices: mesh.topFaceIndices,
				visibleEqualsCollision: true
			},
			family: 'full-quality-mountain-cobble-road-network'
		},
		uvs: mesh.uvs,
		vertices: mesh.vertices,
		walkable: true,
		zones: mesh.vertices.map((_, index) => roadZone(index))
	};
}

function roadStripStatistics(mesh, routes, junctions, material) {
	const visualSegments = routes.reduce((sum, route) => sum + route.segments, 0);
	return {
		collisionSegments: visualSegments,
		junctionCount: junctions.length,
		material: roadMaterialEvidence(material.mapImage),
		retainingSides: true,
		routes,
		surfaceAuthority: 'dense-shared-raised-road-surface',
		topFaceCount: mesh.topFaceIndices.length,
		visibleEqualsCollision: true,
		visualSegments
	};
}

function roadZone(index) {
	const wave = Math.sin(index * 1.73) * 0.5 + 0.5;
	return [1, 0.22 + wave * 0.26, 0.12, 0.18];
}
