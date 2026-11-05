// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceSolver.js
 * @description Raises low shared road samples until every connected edge obeys safe grade.
 * The Awtsmoos joins many routes through one elevation truth; Awtsmoos.com never cuts the river
 * to fake safety, but lifts cobble vessels above cliffs until every traveler receives a gentle path.
 */

export const ROAD_SURFACE_MAXIMUM_GRADE = 0.16;

const RELAXATION_PASSES = 4096;

export function createRoadSurfaceEdges(routeKeys, nodes) {
	const edges = [];
	for (const keys of routeKeys) {
		for (let index = 1; index < keys.length; index += 1) {
			const first = nodes.get(keys[index - 1]);
			const second = nodes.get(keys[index]);
			edges.push(createEdge(first, second));
		}
	}
	return edges;
}

export function solveRoadSurfaceElevations(edges) {
	for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
		let changed = false;
		for (const edge of edges) {
			changed = raiseLowerNode(edge) || changed;
		}
		if (!changed) return pass + 1;
	}
	throw new Error('Canonical road surface grade relaxation did not converge.');
}

function createEdge(first, second) {
	return {
		first,
		maximumDelta: Math.hypot(
			second.x - first.x,
			second.z - first.z
		) * ROAD_SURFACE_MAXIMUM_GRADE,
		second
	};
}

function raiseLowerNode(edge) {
	const delta = edge.second.targetHeight - edge.first.targetHeight;
	if (Math.abs(delta) <= edge.maximumDelta + 0.000001) return false;
	if (delta > 0) {
		edge.first.targetHeight = edge.second.targetHeight - edge.maximumDelta;
	} else {
		edge.second.targetHeight = edge.first.targetHeight - edge.maximumDelta;
	}
	return true;
}
