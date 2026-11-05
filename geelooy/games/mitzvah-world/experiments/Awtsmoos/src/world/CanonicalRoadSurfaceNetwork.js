// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceNetwork.js
 * @description Coordinates dense support sampling and one shared safe-grade road elevation graph.
 * The Awtsmoos joins authored destinations, living hydrology, and walkable cobble without conflict;
 * Awtsmoos.com raises only the road vessel while cliffs, banks, riverbeds, and terraces remain real.
 */

import {
	denseRoadPoints,
	registerRoadSurfaceNode,
	ROAD_SURFACE_CLEARANCE,
	ROAD_SURFACE_SAMPLE_SPACING
} from './CanonicalRoadSurfaceSampling.js';
import {
	createRoadSurfaceEdges,
	ROAD_SURFACE_MAXIMUM_GRADE,
	solveRoadSurfaceElevations
} from './CanonicalRoadSurfaceSolver.js';
import { canonicalVillageRoadRoutes } from './village/CanonicalVillageRoads.js';

let cachedNetwork = null;

export function canonicalRoadSurfaceRoutes() {
	return roadSurfaceNetwork().routes;
}

export function canonicalRoadSurfaceEvidence() {
	return roadSurfaceNetwork().evidence;
}

function roadSurfaceNetwork() {
	if (!cachedNetwork) cachedNetwork = buildNetwork();
	return cachedNetwork;
}

function buildNetwork() {
	const sourceRoutes = canonicalVillageRoadRoutes();
	const nodes = new Map();
	const routeKeys = sourceRoutes.map(route => {
		return denseRoadPoints(route.points).map(point => {
			return registerRoadSurfaceNode(point, nodes);
		});
	});
	const edges = createRoadSurfaceEdges(routeKeys, nodes);
	const relaxationPasses = solveRoadSurfaceElevations(edges);
	const routes = sourceRoutes.map((route, index) => {
		return solvedRoute(route, routeKeys[index], nodes);
	});
	return Object.freeze({
		evidence: Object.freeze({
			clearance: ROAD_SURFACE_CLEARANCE,
			maximumGrade: ROAD_SURFACE_MAXIMUM_GRADE,
			nodeCount: nodes.size,
			relaxationPasses,
			routeCount: routes.length,
			sampleSpacing: ROAD_SURFACE_SAMPLE_SPACING
		}),
		routes: Object.freeze(routes)
	});
}

function solvedRoute(route, keys, nodes) {
	return Object.freeze({
		...route,
		pathfinding: Object.freeze({
			...route.pathfinding,
			gradeAuthority: 'dense-shared-raised-road-surface',
			maximumGrade: ROAD_SURFACE_MAXIMUM_GRADE,
			maximumSampleGap: ROAD_SURFACE_SAMPLE_SPACING
		}),
		points: Object.freeze(keys.map(key => {
			return Object.freeze({ ...nodes.get(key) });
		}))
	});
}
