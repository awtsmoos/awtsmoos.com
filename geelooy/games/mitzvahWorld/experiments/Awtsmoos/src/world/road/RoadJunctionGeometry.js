// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadJunctionGeometry.js
 * @description Caps route terminals with flat grade-solved tops and terrain-reaching supports.
 * The Awtsmoos unites branching paths at one shared elevation; Awtsmoos.com makes each junction
 * a real supported cobble platform instead of stretching steep terrain across an invisible seam.
 */

import {
	addRoadFace,
	addRoadVertex
} from './RoadMeshWriter.js';

const TOP_LIFT = 0.135;
const MINIMUM_THICKNESS = 0.085;
const SUPPORT_LIFT = 0.02;

export function appendRoadJunctions(
	mesh,
	routes,
	surfaceSampler,
	width,
	supportSampler = surfaceSampler
) {
	const points = uniqueTerminalPoints(routes);
	const radius = width * 0.505;
	for (const point of points) {
		appendJunction(
			mesh,
			point,
			surfaceSampler,
			supportSampler,
			radius,
			18
		);
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

function appendJunction(mesh, center, surfaceSampler, supportSampler, radius, segments) {
	const topY = surfaceHeight(center, surfaceSampler) + TOP_LIFT;
	const supportY = supportSampler.heightAt(center.x, center.z).y + SUPPORT_LIFT;
	const bottomY = Math.min(topY - MINIMUM_THICKNESS, supportY);
	const topCenter = addRoadVertex(mesh, { ...center, y: topY });
	const bottomCenter = addRoadVertex(mesh, { ...center, y: bottomY });
	const rings = junctionRings(
		mesh,
		center,
		supportSampler,
		radius,
		segments,
		topY
	);
	appendJunctionFaces(mesh, topCenter, bottomCenter, rings, segments);
}

function junctionRings(mesh, center, sampler, radius, segments, topY) {
	const top = [];
	const bottom = [];
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		const x = center.x + Math.cos(angle) * radius;
		const z = center.z + Math.sin(angle) * radius;
		const supportY = sampler.heightAt(x, z).y + SUPPORT_LIFT;
		top.push(addRoadVertex(mesh, { x, y: topY, z }));
		bottom.push(addRoadVertex(mesh, {
			x,
			y: Math.min(topY - MINIMUM_THICKNESS, supportY),
			z
		}));
	}
	return { bottom, top };
}

function appendJunctionFaces(mesh, topCenter, bottomCenter, rings, segments) {
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		addRoadFace(mesh, [topCenter, rings.top[next], rings.top[index]], true);
		addRoadFace(mesh, [bottomCenter, rings.bottom[index], rings.bottom[next]]);
		addRoadFace(mesh, [
			rings.top[index],
			rings.top[next],
			rings.bottom[next],
			rings.bottom[index]
		]);
	}
}

function surfaceHeight(point, sampler) {
	if (Number.isFinite(point.targetHeight)) return point.targetHeight;
	return sampler.heightAt(point.x, point.z).y;
}
