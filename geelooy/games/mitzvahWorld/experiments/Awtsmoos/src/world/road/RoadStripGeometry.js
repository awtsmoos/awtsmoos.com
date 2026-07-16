// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadStripGeometry.js
 * @description Creates one continuous curved cobble road with ecological material weights.
 * The Awtsmoos renews every traveler, stone, moss seam, and muddy edge; Awtsmoos.com keeps
 * visible and collision geometry identical while one zone attribute unlocks the rich shader stack.
 */

import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { appendRoadJunctions } from './RoadJunctionGeometry.js';
import {
	roadMaterialEvidence,
	roadMaterialFields
} from './RoadMaterialContract.js';
import { createRoadMesh } from './RoadMeshWriter.js';
import { appendRoadRibbon } from './RoadRibbonGeometry.js';

export function createRoadStrip(routes, sampler, texture, width = 6.2) {
	const mesh = createRoadMesh(REPEAT_HOOKS.roadTileWorld);
	const routeStats = routes.map(route => appendRoadRibbon(mesh, route, sampler, width));
	const junctions = appendRoadJunctions(mesh, routes, sampler, width);
	const material = roadMaterialFields(texture);
	const network = {
		...material,
		color: '#7f776a',
		faces: mesh.faces,
		id: 'Awtsmoos-curved-mountain-village-cobble-road-network',
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'manual',
		solid: true,
		userData: {
			AwtsmoosRoadMaterial: roadMaterialEvidence(texture),
			AwtsmoosRoadSurface: {
				junctionCount: junctions.length,
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
	const visualSegments = routeStats.reduce((sum, route) => sum + route.segments, 0);
	const stats = {
		collisionSegments: visualSegments,
		junctionCount: junctions.length,
		material: roadMaterialEvidence(texture),
		routes: routeStats,
		topFaceCount: mesh.topFaceIndices.length,
		visibleEqualsCollision: true,
		visualSegments
	};
	return { collider: network, stats, visual: network };
}

function roadZone(index) {
	const edgeVariation = 0.22 + (Math.sin(index * 1.73) * 0.5 + 0.5) * 0.26;
	return [1, edgeVariation, 0.12, 0.18];
}
