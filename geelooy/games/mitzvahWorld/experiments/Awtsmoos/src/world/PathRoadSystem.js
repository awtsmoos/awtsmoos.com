// B"H
import { houseAllAnchors, houseAllSpecs } from './House3D.js';
import { createRoadGraph } from './road/RoadGraph.js';
import { planRoadRoutes } from './road/RoadRoutePlanner.js';
import { createRoadStrip } from './road/RoadStripGeometry.js';
import { inspectRoadStripClearance } from './road/RoadStripClearance.js';
import {
	createStaticObstacleField,
	routeIntersections
} from './road/StaticObstacleField.js';

export const ROAD_WIDTH = 6.2;
export const ROAD_SAFETY_MARGIN = 0.35;

/** Builds one curved, solid road network that reaches every house landing. */
export function houseRoadSystem(assets, groundSampler, staticDefinitions = []) {
	const anchors = roadAnchors();
	const graph = createRoadGraph(anchors.houses);
	const specs = houseAllSpecs();
	const rawField = createStaticObstacleField(staticDefinitions, specs, ROAD_SAFETY_MARGIN);
	const planningField = createStaticObstacleField(
		staticDefinitions,
		specs,
		ROAD_WIDTH / 2 + ROAD_SAFETY_MARGIN
	);
	const routes = planRoadRoutes(graph, planningField);
	const strip = createRoadStrip(routes, groundSampler, assets.yellowBrickImage, ROAD_WIDTH);
	const routeHits = routeIntersections(planningField, routes);
	const stripClearance = inspectRoadStripClearance(strip.visual, rawField);
	const foldedSegments = routes.flatMap((route) => (
		route.foldedSegments.map((index) => ({ routeId: route.id, index }))
	));
	const pathFailures = routes
		.filter((route) => route.pathfinding.failed)
		.map((route) => route.id);
	const terminalGaps = routes.flatMap((route) => [
		{ routeId: route.id, end: 'from', distance: route.terminalDistances.from },
		{ routeId: route.id, end: 'to', distance: route.terminalDistances.to }
	]).filter((item) => item.distance > 0.01);
	const stats = {
		...graph.validation,
		...strip.stats,
		...stripClearance,
		foldedSegments,
		terminalGaps,
		maxTurnAngle: maximumTurnAngle(routes),
		connected: graph.validation.connected,
		obstacleCount: rawField.obstacles.length,
		planningClearance: planningField.clearance,
		routeIntersections: routeHits,
		pathFailures,
		pathfindingMethod: 'a-star-clearance-curves-with-solid-junctions',
		routeEvidence: routes.map((route) => ({ id: route.id, ...route.pathfinding }))
	};
	strip.visual.userData.AwtsmoosRoad = {
		...stats,
		textureLoaded: !!assets.yellowBrickImage,
		textureFallback: assets.yellowBrickImage?.dataset?.fallback === 'true'
	};
	return {
		anchors,
		graph,
		routes: routes.map((route) => route.id),
		visual: strip.visual,
		colliders: [strip.visual],
		stats
	};
}

export function roadAnchors() {
	const all = houseAllAnchors();
	return {
		houses: [all.main, ...all.district],
		plaza: { x: 31, z: -22 }
	};
}

export function roadNetworkDef({ texture, groundSampler, routes = [] }) {
	return createRoadStrip(routes, groundSampler, texture).visual;
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
