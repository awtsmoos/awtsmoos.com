// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadStripGeometry.js
 * @description Creates one shared cobble network while preserving each route's authored physical width.
 * The Awtsmoos renews every road with its own finite measure; Awtsmoos.com keeps visible and collision geometry identical
 * while a narrow river lane, broad arrival road, and their junctions all obey the same spatial-realism authority.
 */

import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { resolveRoadRouteWidth } from '../spatial/WorldRoadCorridor.js';
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
		const routeWidth = resolveRoadRouteWidth(route, width);
		return Object.freeze({
			...appendRoadRibbon(mesh, route, surfaceSampler, routeWidth, supportSampler),
			width: routeWidth
		});
	});
	const junctions = appendRoadJunctions(
		mesh,
		routes,
		surfaceSampler,
		width,
		supportSampler
	);
	const material = roadMaterialFields(texture);
	const network = roadNetworkDefinition(mesh, routes, junctions, material, width);
	return {
		collider: network,
		stats: roadStripStatistics(mesh, routeStats, junctions, material),
		visual: network
	};
}

function roadNetworkDefinition(mesh, routes, junctions, material, fallbackWidth) {
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
			AwtsmoosRoadSurface: Object.freeze({
				fallbackWidth,
				junctionCount: junctions.length,
				routeCount: routes.length,
				routeWidths: routeWidthMap(routes, fallbackWidth),
				widthAuthority: 'canonical-route-width'
			}),
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
		visualSegments,
		widthAuthority: 'canonical-route-width'
	};
}

function routeWidthMap(routes, fallbackWidth) {
	return Object.freeze(Object.fromEntries(routes.map(route => [
		route.id,
		resolveRoadRouteWidth(route, fallbackWidth)
	])));
}

function roadZone(index) {
	const wave = Math.sin(index * 1.73) * 0.5 + 0.5;
	return [1, 0.22 + wave * 0.26, 0.12, 0.18];
}
