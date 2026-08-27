// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PathRoadSystem.js
 * @description Builds the canonical network from dense safe-grade tops and real terrain supports.
 * The Awtsmoos opens a curved passage between every village purpose; Awtsmoos.com keeps arrival,
 * market, Shul, homes, farms, bridge, and waterfall connected without paving steep river cliffs.
 */

import {
	canonicalRoadSurfaceEvidence,
	canonicalRoadSurfaceRoutes
} from './CanonicalRoadSurfaceNetwork.js';
import { createRoadStrip } from './road/RoadStripGeometry.js';
import { createPathRoadStatistics } from './road/PathRoadStatistics.js';
import { createStaticObstacleField } from './road/StaticObstacleField.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from './village/CanonicalVillageFootprints.js';
import { canonicalRoadNetworkEvidence } from './village/CanonicalVillageRoads.js';

export const ROAD_WIDTH = 5.8;
export const ROAD_SAFETY_MARGIN = 0.35;

export function houseRoadSystem(assets, groundSampler, staticDefinitions = []) {
	const routes = canonicalRoadSurfaceRoutes();
	const surfaceEvidence = canonicalRoadSurfaceEvidence();
	const strip = createRoadStrip(
		routes,
		groundSampler,
		null,
		ROAD_WIDTH,
		groundSampler
	);
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
		materialAuthority: 'mountain-village-cobble-stack'
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
	return createRoadStrip(
		routes,
		groundSampler,
		texture,
		ROAD_WIDTH,
		groundSampler
	).visual;
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
