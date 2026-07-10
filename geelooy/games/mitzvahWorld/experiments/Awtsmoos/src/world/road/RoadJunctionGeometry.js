// B"H
import {
	addRoadFace,
	addRoadVertex
} from './RoadMeshWriter.js';

/** Covers every route terminal without extending beyond the ribbon footprint. */
export function appendRoadJunctions(mesh, routes, sampler, width) {
	const points = uniqueTerminalPoints(routes);
	const radius = width * 0.505;
	for (const point of points) {
		appendJunction(mesh, point, sampler, radius, 18);
	}
	return points;
}

function uniqueTerminalPoints(routes) {
	const map = new Map();
	for (const route of routes) {
		for (const point of [route.points[0], route.points.at(-1)]) {
			if (!point) continue;
			map.set(`${point.x.toFixed(3)},${point.z.toFixed(3)}`, point);
		}
	}
	return [...map.values()];
}

function appendJunction(mesh, center, sampler, radius, segments) {
	const baseY = sampler.heightAt(center.x, center.z).y;
	const topCenter = addRoadVertex(mesh, { ...center, y: baseY + 0.135 });
	const bottomCenter = addRoadVertex(mesh, { ...center, y: baseY - 0.085 });
	const topRing = [];
	const bottomRing = [];
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		const x = center.x + Math.cos(angle) * radius;
		const z = center.z + Math.sin(angle) * radius;
		const groundY = sampler.heightAt(x, z).y;
		topRing.push(addRoadVertex(mesh, { x, y: groundY + 0.135, z }));
		bottomRing.push(addRoadVertex(mesh, { x, y: groundY - 0.085, z }));
	}
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		addRoadFace(mesh, [topCenter, topRing[index], topRing[next]], true);
		addRoadFace(mesh, [bottomCenter, bottomRing[next], bottomRing[index]]);
		addRoadFace(mesh, [
			topRing[index],
			bottomRing[index],
			bottomRing[next],
			topRing[next]
		]);
	}
}
