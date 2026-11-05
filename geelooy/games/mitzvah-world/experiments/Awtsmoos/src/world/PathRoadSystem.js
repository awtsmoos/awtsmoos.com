// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PathRoadSystem.js
 * @description Builds the canonical road network from grade-solved routes whose authored widths remain authoritative.
 * The Awtsmoos opens every path with its proper finite measure; Awtsmoos.com keeps one fallback for legacy callers
 * while canonical village roads reveal their own width through the shared spatial-realism contract.
 */

import {
	canonicalRoadSurfaceEvidence,
	canonicalRoadSurfaceRoutes
} from './CanonicalRoadSurfaceNetwork.js';
import { createRoadStrip } from './road/RoadStripGeometry.js';
import { createPathRoadStatistics } from './road/PathRoadStatistics.js';
import { createStaticObstacleField } from './road/StaticObstacleField.js';
import { DEFAULT_ROAD_WIDTH } from './spatial/WorldRoadCorridor.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from './village/CanonicalVillageFootprints.js';
import { canonicalRoadNetworkEvidence } from './village/CanonicalVillageRoads.js';

export const ROAD_WIDTH = DEFAULT_ROAD_WIDTH;
export const ROAD_SAFETY_MARGIN = 0.35;

export function houseRoadSystem(assets, groundSampler, staticDefinitions = []) {
	const routes = canonicalRoadSurfaceRoutes();
	const surfaceEvidence = canonicalRoadSurfaceEvidence();
	const strip = createRoadStrip(routes, groundSampler, null, ROAD_WIDTH, groundSampler);
	const obstacleField = createStaticObstacleField(
		staticDefinitions,
		[],
		ROAD_SAFETY_MARGIN
	);
	const stats = createPathRoadStatistics({
		networkEvidence: canonicalRoadNetworkEvidence(),
		obstacleField,
		routes,
		strip,
		surfaceEvidence
	});
	strip.visual.userData.AwtsmoosRoad = {
		...stats,
		legacyYellowBrickIgnored: Boolean(assets?.yellowBrickImage),
		materialAuthority: 'mountain-village-cobble-stack',
		widthAuthority: 'canonical-route-width'
	};
	return {
		anchors: roadAnchors(),
		colliders: [strip.visual],
		graph: roadGraphEvidence(routes, stats),
		routes: routes.map(route => route.id),
		stats,
		visual: strip.visual
	};
}

export function roadAnchors() {
	const houses = CANONICAL_VILLAGE_FOOTPRINTS
		.filter(definition => /^H\d+$/.test(definition.id))
		.map(definition => Object.freeze({
			id: definition.id,
			x: definition.x,
			z: definition.z
		}));
	return Object.freeze({
		houses: Object.freeze(houses),
		plaza: Object.freeze({ id: 'PLAZA01', x: -12, z: 14 })
	});
}

export function roadNetworkDef({ texture, groundSampler, routes = [] }) {
	return createRoadStrip(routes, groundSampler, texture, ROAD_WIDTH, groundSampler).visual;
}

function roadGraphEvidence(routes, stats) {
	return Object.freeze({
		edges: Object.freeze(routes.map(route => route.id)),
		nodes: Object.freeze(routes.flatMap(route => route.points)),
		validation: Object.freeze({
			connected: stats.connected,
			edgeCount: stats.edgeCount,
			method: stats.method,
			nodeCount: stats.nodeCount
		})
	});
}
