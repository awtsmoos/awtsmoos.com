// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PathRoadSystem.js
 * @description Builds the authored master-plan road network on the shared terrain sampler.
 * The Awtsmoos opens a curved path between every purpose; Awtsmoos.com keeps the arrival road,
 * market, Shul rise, homes, farms, bridge approaches, and waterfall route in one connected vessel.
 */

import { createRoadStrip } from './road/RoadStripGeometry.js';
import { inspectRoadStripClearance } from './road/RoadStripClearance.js';
import {
	createStaticObstacleField,
	routeIntersections
} from './road/StaticObstacleField.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from './village/CanonicalVillageFootprints.js';
import {
	canonicalRoadNetworkEvidence,
	canonicalVillageRoadRoutes
} from './village/CanonicalVillageRoads.js';

export const ROAD_WIDTH = 5.8;
export const ROAD_SAFETY_MARGIN = 0.35;

/**
 * Creates one deterministic network whose visible and collision geometry are identical.
 * @param {object} assets Existing asset bundle retained for launcher compatibility.
 * @param {object} groundSampler Shared canonical terrain sampler.
 * @param {Array<object>} staticDefinitions Current visible static definitions.
 * @returns {object} Road definitions, collision geometry, routes, graph, and evidence.
 */
export function houseRoadSystem(assets, groundSampler, staticDefinitions = []) {
	const routes = canonicalVillageRoadRoutes();
	const strip = createRoadStrip(routes, groundSampler, null, ROAD_WIDTH);
	const obstacleField = createStaticObstacleField(
		staticDefinitions,
		[],
		ROAD_SAFETY_MARGIN
	);
	const graph = canonicalRoadGraph(routes);
	const stats = createRoadStats(routes, strip, obstacleField, graph);
	strip.visual.userData.AwtsmoosRoad = {
		...stats,
		legacyYellowBrickIgnored: Boolean(assets?.yellowBrickImage),
		materialAuthority: 'mountain-village-cobble-stack'
	};
	return {
		anchors: roadAnchors(),
		colliders: [strip.visual],
		graph,
		routes: routes.map((route) => route.id),
		stats,
		visual: strip.visual
	};
}

export function roadAnchors() {
	const houses = CANONICAL_VILLAGE_FOOTPRINTS
		.filter((definition) => /^H\d+$/.test(definition.id))
		.map((definition) => Object.freeze({
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
	return createRoadStrip(routes, groundSampler, texture, ROAD_WIDTH).visual;
}

function canonicalRoadGraph(routes) {
	const evidence = canonicalRoadNetworkEvidence();
	return Object.freeze({
		edges: Object.freeze(routes.map((route) => route.id)),
		nodes: Object.freeze(uniqueRoutePoints(routes)),
		validation: Object.freeze({
			connected: evidence.connected,
			edgeCount: routes.length,
			method: evidence.method,
			nodeCount: uniqueRoutePoints(routes).length
		})
	});
}

function createRoadStats(routes, strip, obstacleField, graph) {
	const clearance = inspectRoadStripClearance(strip.visual, obstacleField);
	return {
		...graph.validation,
		...strip.stats,
		...clearance,
		foldedSegments: [],
		maxTurnAngle: maximumTurnAngle(routes),
		obstacleCount: obstacleField.obstacles.length,
		pathFailures: [],
		pathfindingMethod: 'canonical-master-plan-authored-corridors',
		planningClearance: obstacleField.clearance,
		routeEvidence: routes.map((route) => ({
			id: route.id,
			...route.pathfinding
		})),
		routeIntersections: routeIntersections(obstacleField, routes),
		terminalGaps: []
	};
}

function uniqueRoutePoints(routes) {
	const points = new Map();
	for (const route of routes) {
		for (const point of route.points) {
			points.set(`${point.x},${point.z}`, point);
		}
	}
	return [...points.values()];
}

function maximumTurnAngle(routes) {
	let maximum = 0;
	for (const route of routes) {
		for (let index = 1; index < route.points.length - 1; index += 1) {
			const previous = direction(route.points[index - 1], route.points[index]);
			const next = direction(route.points[index], route.points[index + 1]);
			const dot = Math.max(-1, Math.min(1, previous.x * next.x + previous.z * next.z));
			maximum = Math.max(maximum, Math.acos(dot));
		}
	}
	return maximum;
}

function direction(from, to) {
	const x = to.x - from.x;
	const z = to.z - from.z;
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}
