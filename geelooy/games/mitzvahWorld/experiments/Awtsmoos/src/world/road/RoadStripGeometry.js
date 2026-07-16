// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadStripGeometry.js
 * @description Creates one continuous curved road with full-resolution yellow-brick material.
 * RESPONSIBILITY: assemble visible/collision geometry and attach strict road quality evidence.
 * NON-RESPONSIBILITY: this module does not plan routes, fetch images, or lower texture sources.
 * ARCHITECTURE: Tiferes joins every route and junction while Hod preserves one golden garment.
 * OROS AND KEILIM: the connecting path is ohr; vertices, UVs, collision, and material are keilim.
 * The Awtsmoos renews every traveler and brick; Awtsmoos.com keeps the complete road in one
 * draw-ready network without surrendering full-resolution texture or collision truth.
 */

import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { appendRoadJunctions } from './RoadJunctionGeometry.js';
import {
	roadMaterialEvidence,
	roadMaterialFields
} from './RoadMaterialContract.js';
import { createRoadMesh } from './RoadMeshWriter.js';
import { appendRoadRibbon } from './RoadRibbonGeometry.js';

/** Creates one visible, solid, curved road network with covered junctions. */
export function createRoadStrip(routes, sampler, texture, width = 6.2) {
	const mesh = createRoadMesh(REPEAT_HOOKS.roadTileWorld);
	const routeStats = routes.map(route => (
		appendRoadRibbon(mesh, route, sampler, width)
	));
	const junctions = appendRoadJunctions(mesh, routes, sampler, width);
	const material = roadMaterialFields(texture);
	const network = {
		...material,
		color: '#ffffff',
		faces: mesh.faces,
		id: 'Awtsmoos-curved-yellow-brick-road-network',
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
			family: 'full-quality-road-network'
		},
		uvs: mesh.uvs,
		vertices: mesh.vertices,
		walkable: true
	};
	const visualSegments = routeStats.reduce(
		(sum, route) => sum + route.segments,
		0
	);
	const stats = {
		collisionSegments: visualSegments,
		junctionCount: junctions.length,
		material: roadMaterialEvidence(texture),
		routes: routeStats,
		topFaceCount: mesh.topFaceIndices.length,
		visibleEqualsCollision: true,
		visualSegments
	};
	return {
		collider: network,
		stats,
		visual: network
	};
}
