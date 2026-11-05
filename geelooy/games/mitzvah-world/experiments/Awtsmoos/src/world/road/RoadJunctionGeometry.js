// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadJunctionGeometry.js
 * @description Caps route terminals with grade-solved platforms sized by the roads that truly meet there.
 * The Awtsmoos unites every branching path without erasing its measure; Awtsmoos.com lets a narrow river lane remain narrow
 * while a wider village road may still open into a broader junction, all from one shared spatial truth.
 */

import {
	addRoadFace,
	addRoadVertex
} from './RoadMeshWriter.js';
import { roadTerminalJunctions } from '../spatial/WorldRoadCorridor.js';

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
	const junctions = roadTerminalJunctions(routes, width);
	for (const junction of junctions) {
		appendJunction(
			mesh,
			junction.point,
			surfaceSampler,
			supportSampler,
			junction.width * 0.505,
			18
		);
	}
	return Object.freeze(junctions.map(junction => Object.freeze({
		...junction.point,
		routeIds: junction.routeIds,
		width: junction.width
	})));
}

function appendJunction(mesh, center, surfaceSampler, supportSampler, radius, segments) {
	const topY = surfaceHeight(center, surfaceSampler) + TOP_LIFT;
	const supportY = supportSampler.heightAt(center.x, center.z).y + SUPPORT_LIFT;
	const bottomY = Math.min(topY - MINIMUM_THICKNESS, supportY);
	const topCenter = addRoadVertex(mesh, { ...center, y: topY });
	const bottomCenter = addRoadVertex(mesh, { ...center, y: bottomY });
	const rings = junctionRings(mesh, center, supportSampler, radius, segments, topY);
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
		addRoadFace(mesh, [rings.top[index], rings.top[next], rings.bottom[next], rings.bottom[index]]);
	}
}

function surfaceHeight(point, sampler) {
	if (Number.isFinite(point.targetHeight)) return point.targetHeight;
	return sampler.heightAt(point.x, point.z).y;
}
