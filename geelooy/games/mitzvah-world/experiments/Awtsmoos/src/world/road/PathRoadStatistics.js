// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PathRoadStatistics.js
 * @description Summarizes one visible and collidable canonical cobble network.
 * The Awtsmoos joins every route through shared destinations; Awtsmoos.com records graph truth,
 * support walls, turns, material authority, obstacle clearance, and dense grade-solved evidence.
 */

import { inspectRoadStripClearance } from './RoadStripClearance.js';
import { routeIntersections } from './StaticObstacleField.js';

export function createPathRoadStatistics(context) {
	const graph = roadGraph(context.routes, context.networkEvidence);
	const clearance = inspectRoadStripClearance(
		context.strip.visual,
		context.obstacleField
	);
	return {
		...graph.validation,
		...context.strip.stats,
		...clearance,
		foldedSegments: [],
		maxTurnAngle: maximumTurnAngle(context.routes),
		obstacleCount: context.obstacleField.obstacles.length,
		pathFailures: [],
		pathfindingMethod: 'dense-grade-constrained-canonical-corridors',
		planningClearance: context.obstacleField.clearance,
		roadSurface: context.surfaceEvidence,
		routeEvidence: context.routes.map(route => ({
			id: route.id,
			...route.pathfinding
		})),
		routeIntersections: routeIntersections(
			context.obstacleField,
			context.routes
		),
		terminalGaps: []
	};
}

function roadGraph(routes, evidence) {
	const nodes = uniqueRoutePoints(routes);
	return Object.freeze({
		edges: Object.freeze(routes.map(route => route.id)),
		nodes: Object.freeze(nodes),
		validation: Object.freeze({
			connected: evidence.connected,
			edgeCount: routes.length,
			method: evidence.method,
			nodeCount: nodes.length
		})
	});
}

function uniqueRoutePoints(routes) {
	const points = new Map();
	for (const route of routes) {
		for (const point of route.points) {
			points.set(`${point.x.toFixed(5)},${point.z.toFixed(5)}`, point);
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
			const dot = Math.max(
				-1,
				Math.min(1, previous.x * next.x + previous.z * next.z)
			);
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
