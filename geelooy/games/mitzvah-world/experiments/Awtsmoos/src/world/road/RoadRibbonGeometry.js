// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadRibbonGeometry.js
 * @description Builds a grade-solved road top with retaining sides down to terrain support.
 * The Awtsmoos holds elevated cobble and riverbank in one truth; Awtsmoos.com keeps the visible
 * walkable surface gentle while side walls descend honestly into steep alpine ground beneath it.
 */

import {
	addRoadFace,
	addRoadVertex
} from './RoadMeshWriter.js';
import {
	roadBottomPoint,
	roadSectionEdges,
	roadSurfaceHeight
} from './RoadSurfaceSection.js';

export const ROAD_TOP_LIFT = 0.12;

/** Appends one supported collision-identical road ribbon to a shared mesh. */
export function appendRoadRibbon(
	mesh,
	route,
	surfaceSampler,
	width,
	supportSampler = surfaceSampler
) {
	const sections = route.points.map((point, index) => {
		return createSection(
			mesh,
			route.points,
			index,
			surfaceSampler,
			supportSampler,
			width
		);
	});
	for (let index = 0; index < sections.length - 1; index += 1) {
		appendSegment(mesh, sections[index], sections[index + 1]);
	}
	if (sections.length) {
		appendCap(mesh, sections[0], true);
		appendCap(mesh, sections.at(-1), false);
	}
	return routeStatistics(route, sections.length);
}

function createSection(mesh, points, index, surfaceSampler, supportSampler, width) {
	const center = points[index];
	const topY = roadSurfaceHeight(center, surfaceSampler) + ROAD_TOP_LIFT;
	const edges = roadSectionEdges(points, index, width, supportSampler);
	return {
		bottomLeft: addRoadVertex(mesh, roadBottomPoint(edges.left, topY)),
		bottomRight: addRoadVertex(mesh, roadBottomPoint(edges.right, topY)),
		topLeft: addRoadVertex(mesh, { x: edges.left.x, y: topY, z: edges.left.z }),
		topRight: addRoadVertex(mesh, { x: edges.right.x, y: topY, z: edges.right.z })
	};
}

function appendSegment(mesh, current, next) {
	addRoadFace(mesh, [
		current.topLeft, next.topLeft, next.topRight, current.topRight
	], true);
	addRoadFace(mesh, [
		current.bottomLeft, current.topLeft, next.topLeft, next.bottomLeft
	]);
	addRoadFace(mesh, [
		current.topRight, current.bottomRight, next.bottomRight, next.topRight
	]);
	addRoadFace(mesh, [
		current.bottomRight, current.bottomLeft, next.bottomLeft, next.bottomRight
	]);
}

function appendCap(mesh, section, start) {
	const face = start
		? [section.bottomRight, section.bottomLeft, section.topLeft, section.topRight]
		: [section.bottomLeft, section.bottomRight, section.topRight, section.topLeft];
	addRoadFace(mesh, face);
}

function routeStatistics(route, sectionCount) {
	return {
		id: route.id,
		maximumSampleGap: route.pathfinding.maximumSampleGap,
		sections: sectionCount,
		segments: Math.max(0, sectionCount - 1),
		supportMode: 'retaining-sides-to-live-terrain',
		terminalDistances: route.terminalDistances
	};
}
