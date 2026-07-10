// B"H
import {
	addRoadFace,
	addRoadVertex
} from './RoadMeshWriter.js';

/** Appends one closed road ribbon whose cross-sections share their vertices. */
export function appendRoadRibbon(mesh, route, sampler, width) {
	const sections = route.points.map((point, index) => (
		createSection(mesh, route.points, index, sampler, width)
	));
	for (let index = 0; index < sections.length - 1; index += 1) {
		appendSegment(mesh, sections[index], sections[index + 1]);
	}
	if (sections.length) {
		appendCap(mesh, sections[0], true);
		appendCap(mesh, sections.at(-1), false);
	}
	return {
		id: route.id,
		sections: sections.length,
		segments: Math.max(0, sections.length - 1),
		terminalDistances: route.terminalDistances,
		maximumSampleGap: route.pathfinding.maximumSampleGap
	};
}

function createSection(mesh, points, index, sampler, width) {
	const normal = pointNormal(points, index);
	const center = points[index];
	const left = edgePoint(center, normal, width / 2, sampler);
	const right = edgePoint(center, normal, -width / 2, sampler);
	const topLift = 0.12;
	const bottomDrop = 0.08;
	return {
		topLeft: addRoadVertex(mesh, { ...left, y: left.y + topLift }),
		topRight: addRoadVertex(mesh, { ...right, y: right.y + topLift }),
		bottomLeft: addRoadVertex(mesh, { ...left, y: left.y - bottomDrop }),
		bottomRight: addRoadVertex(mesh, { ...right, y: right.y - bottomDrop })
	};
}

function appendSegment(mesh, current, next) {
	addRoadFace(mesh, [
		current.topLeft,
		next.topLeft,
		next.topRight,
		current.topRight
	], true);
	addRoadFace(mesh, [
		current.bottomLeft,
		current.topLeft,
		next.topLeft,
		next.bottomLeft
	]);
	addRoadFace(mesh, [
		current.topRight,
		current.bottomRight,
		next.bottomRight,
		next.topRight
	]);
	addRoadFace(mesh, [
		current.bottomRight,
		current.bottomLeft,
		next.bottomLeft,
		next.bottomRight
	]);
}

function appendCap(mesh, section, start) {
	const face = start
		? [section.bottomRight, section.bottomLeft, section.topLeft, section.topRight]
		: [section.bottomLeft, section.bottomRight, section.topRight, section.topLeft];
	addRoadFace(mesh, face);
}

function edgePoint(point, normal, offset, sampler) {
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
