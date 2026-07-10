// B"H
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';
import { appendRoadJunctions } from './RoadJunctionGeometry.js';
import { createRoadMesh } from './RoadMeshWriter.js';
import { appendRoadRibbon } from './RoadRibbonGeometry.js';

/** Creates one visible, solid, curved road network with covered junctions. */
export function createRoadStrip(routes, sampler, texture, width = 6.2) {
	const mesh = createRoadMesh(REPEAT_HOOKS.roadTileWorld);
	const routeStats = routes.map((route) => (
		appendRoadRibbon(mesh, route, sampler, width)
	));
	const junctions = appendRoadJunctions(mesh, routes, sampler, width);
	const network = {
		id: 'Awtsmoos-curved-yellow-brick-road-network',
		shape: 'manual',
		solid: true,
		walkable: true,
		noEdge: true,
		color: '#ffffff',
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		vertices: mesh.vertices,
		faces: mesh.faces,
		uvs: mesh.uvs,
		mapImage: texture || null,
		textureUrl: texture?.dataset?.publicUrl
			|| texture?.dataset?.url
			|| texture?.src
			|| null,
		mapRepeat: [1, 1],
		anisotropy: 2,
		texturePolicy: {
			fullResolution: true,
			projection: 'world-planar-continuous-network',
			tileWorld: REPEAT_HOOKS.roadTileWorld,
			repeatMode: 'mirror-pingpong'
		},
		userData: {
			AwtsmoosRoadSurface: {
				topFaceIndices: mesh.topFaceIndices,
				visibleEqualsCollision: true,
				junctionCount: junctions.length,
				routeCount: routes.length
			}
		}
	};
	const stats = {
		visualSegments: routeStats.reduce((sum, route) => sum + route.segments, 0),
		collisionSegments: routeStats.reduce((sum, route) => sum + route.segments, 0),
		visibleEqualsCollision: true,
		junctionCount: junctions.length,
		topFaceCount: mesh.topFaceIndices.length,
		routes: routeStats
	};
	return {
		visual: network,
		collider: network,
		stats
	};
}
