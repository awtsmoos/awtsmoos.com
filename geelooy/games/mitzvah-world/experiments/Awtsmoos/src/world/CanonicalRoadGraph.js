// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadGraph.js
 * @description Solves one shared grade-constrained elevation graph for every canonical road.
 * The Awtsmoos gives many routes one ground truth; Awtsmoos.com lets shared junctions own one
 * elevation while neighboring control points relax until no authored segment exceeds safe grade.
 */

import { canonicalVillageRoadRoutes } from './village/CanonicalVillageRoads.js';

const MAXIMUM_GRAPH_GRADE = 0.16;
const RELAXATION_PASSES = 512;
let cachedGraph = null;

/**
 * Returns a shared immutable road graph measured from unmodified canonical terrain.
 *
 * @param {Function} baseHeightAt Unmodified terrain height callback.
 * @returns {Readonly<{nodes: Map<string, object>, routes: object[]}>} Solved graph.
 */
export function canonicalRoadGraph(baseHeightAt) {
	if (!cachedGraph) {
		cachedGraph = buildRoadGraph(baseHeightAt);
	}
	return cachedGraph;
}

function buildRoadGraph(baseHeightAt) {
	const sourceRoutes = canonicalVillageRoadRoutes();
	const nodes = createNodes(sourceRoutes, baseHeightAt);
	const edges = createEdges(sourceRoutes, nodes);
	relaxElevations(edges);
	const routes = sourceRoutes.map((route) => {
		return Object.freeze({
			...route,
			points: Object.freeze(route.points.map((point) => {
				return Object.freeze(nodes.get(pointKey(point)));
			}))
		});
	});
	return Object.freeze({
		nodes,
		routes: Object.freeze(routes)
	});
}

function createNodes(routes, baseHeightAt) {
	const nodes = new Map();
	for (const route of routes) {
		for (const point of route.points) {
			const key = pointKey(point);
			if (!nodes.has(key)) {
				nodes.set(key, {
				targetHeight: baseHeightAt(point.x, point.z),
				x: point.x,
				z: point.z
				});
			}
		}
	}
	return nodes;
}

function createEdges(routes, nodes) {
	const edges = [];
	for (const route of routes) {
		for (let index = 1; index < route.points.length; index += 1) {
			const first = nodes.get(pointKey(route.points[index - 1]));
			const second = nodes.get(pointKey(route.points[index]));
			edges.push({
				first,
				maximumDelta: Math.hypot(
					second.x - first.x,
					second.z - first.z
				) * MAXIMUM_GRAPH_GRADE,
				second
			});
		}
	}
	return edges;
}

function relaxElevations(edges) {
	for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
		let changed = false;
		for (const edge of edges) {
			changed = relaxEdge(edge) || changed;
		}
		if (!changed) {
			return;
		}
	}
}

function relaxEdge(edge) {
	const delta = edge.second.targetHeight - edge.first.targetHeight;
	const excess = Math.abs(delta) - edge.maximumDelta;
	if (excess <= 0.000001) {
		return false;
	}
	const direction = Math.sign(delta);
	edge.first.targetHeight += direction * excess / 2;
	edge.second.targetHeight -= direction * excess / 2;
	return true;
}

function pointKey(point) {
	return `${point.x}:${point.z}`;
}
