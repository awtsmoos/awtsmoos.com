// B"H
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';

/** Creates visual and collision definitions from the same sampled road strip. */
export function createRoadStrip(routes, sampler, texture, width = 6.2) {
	const geometry = { vertices: [], faces: [], uvs: [] };
	const routeStats = [];
	for (const route of routes) {
		const start = geometry.vertices.length;
		const result = appendRoute(geometry, route.points, sampler, width);
		routeStats.push({
			id: route.id,
			length: result.length,
			points: route.points.length,
			vertexStart: start,
			foldedSegments: route.foldedSegments
		});
	}
	const shared = {
		shape: 'manual',
		walkable: true,
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		vertices: geometry.vertices,
		faces: geometry.faces,
		rotation: { y: 0 }
	};
	return {
		visual: {
			...shared,
			id: 'Awtsmoos-measured-yellow-brick-road-network',
			solid: false,
			color: '#ffffff',
			uvs: geometry.uvs,
			mapImage: texture || null,
			textureUrl: texture?.dataset?.publicUrl || texture?.dataset?.url || texture?.src || null,
			mapRepeat: [1, 1],
			anisotropy: 2,
			texturePolicy: {
				fullResolution: true,
				projection: 'path-distance',
				tileWorld: REPEAT_HOOKS.roadTileWorld,
				repeatMode: 'mirror-pingpong'
			}
		},
		collider: {
			...shared,
			id: 'Awtsmoos-measured-yellow-brick-road-collision',
			solid: true,
			visible: false,
			color: '#000000'
		},
		stats: {
			visualSegments: Math.max(0, geometry.vertices.length / 4 - routes.length),
			collisionSegments: Math.max(0, geometry.vertices.length / 4 - routes.length),
			routes: routeStats
		}
	};
}

function appendRoute(geometry, points, sampler, width) {
	const startIndex = geometry.vertices.length;
	const distances = cumulativeDistances(points);
	const tile = REPEAT_HOOKS.roadTileWorld;
	for (let index = 0; index < points.length; index += 1) {
		const normal = pointNormal(points, index);
		const point = points[index];
		const left = sampleEdge(point, normal, width / 2, sampler);
		const right = sampleEdge(point, normal, -width / 2, sampler);
		const distanceV = distances[index] / tile;
		geometry.vertices.push(
			[left.x, left.y + 0.12, left.z],
			[right.x, right.y + 0.12, right.z],
			[left.x, left.y - 0.08, left.z],
			[right.x, right.y - 0.08, right.z]
		);
		geometry.uvs.push(0, distanceV, width / tile, distanceV, 0, distanceV, width / tile, distanceV);
	}
	for (let index = 0; index < points.length - 1; index += 1) {
		const current = startIndex + index * 4;
		const next = current + 4;
		geometry.faces.push(
			[current, next, next + 1, current + 1],
			[current, current + 2, next + 2, next],
			[current + 1, next + 1, next + 3, current + 3]
		);
	}
	return { length: distances.at(-1) || 0 };
}

function sampleEdge(point, normal, offset, sampler) {
	const x = point.x + normal.x * offset;
	const z = point.z + normal.z * offset;
	return { x, z, y: sampler.heightAt(x, z).y };
}

function pointNormal(points, index) {
	const before = points[Math.max(0, index - 1)];
	const after = points[Math.min(points.length - 1, index + 1)];
	const dx = after.x - before.x;
	const dz = after.z - before.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}

function cumulativeDistances(points) {
	const distances = [0];
	for (let index = 1; index < points.length; index += 1) {
		distances[index] = distances[index - 1] + Math.hypot(
			points[index].x - points[index - 1].x,
			points[index].z - points[index - 1].z
		);
	}
	return distances;
}
