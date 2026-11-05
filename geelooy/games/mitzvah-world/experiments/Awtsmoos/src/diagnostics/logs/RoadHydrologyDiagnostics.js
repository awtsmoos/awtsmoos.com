// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadHydrologyDiagnostics.js
 * @description Measures real route connectivity and the source-to-outlet water profile.
 * The Awtsmoos joins road, bridge, river, cascade, and bank without confusion; Awtsmoos.com
 * reconstructs those finite connections from coordinates so a boolean claim cannot conceal a gap.
 */

import { CANONICAL_VILLAGE_PLAN } from '../../world/village/CanonicalVillagePlan.js';

export function recordRoadHydrologyDiagnostics(ledger) {
	recordRoadGraph(ledger, CANONICAL_VILLAGE_PLAN.roads);
	recordHydrologyProfile(ledger, CANONICAL_VILLAGE_PLAN.river);
}

function recordRoadGraph(ledger, roads) {
	const graph = createCoordinateGraph(roads.routes, roads.evidence.bridgeApproaches);
	const reached = traverse(graph, graph.keys().next().value);
	const maxGap = maximumRouteGap(roads.routes);
	const valid = graph.size > 0 && reached.size === graph.size && maxGap <= 30;
	ledger.record({
		code: valid ? 'road.graph.measured' : 'road.graph.measurementFailed',
		data: {
			connectedNodes: reached.size,
			maximumSegmentGap: rounded(maxGap),
			nodes: graph.size,
			routes: roads.routes.length
		},
		message: valid
			? 'Coordinate traversal reaches every canonical road node through the bridge.'
			: 'Measured route coordinates contain a disconnected or oversized gap.',
		severity: valid ? 'info' : 'error'
	});
}

function recordHydrologyProfile(ledger, river) {
	const maximumGap = maximumPointGap(river.controlPoints);
	const bridgePoint = river.controlPoints.some(([x, z]) => x === 18 && z === 7);
	const cascadesValid = river.cascades.every((cascade, index) => {
		const previous = river.cascades[index - 1];
		return cascade.drop > 0 && (!previous || cascade.t > previous.t);
	});
	const valid = bridgePoint && cascadesValid && maximumGap <= 30;
	ledger.record({
		code: valid ? 'hydrology.profile.measured' : 'hydrology.profile.invalid',
		data: {
			bridgePoint,
			cascadeDrops: river.cascades.map((cascade) => cascade.drop),
			maximumControlGap: rounded(maximumGap),
			points: river.controlPoints.length
		},
		message: valid
			? 'Measured water controls pass through BRIDGE01 with ordered positive cascades.'
			: 'Water controls fail bridge, cascade, or continuity requirements.',
		severity: valid ? 'info' : 'error'
	});
}

function createCoordinateGraph(routes, bridgeApproaches) {
	const graph = new Map();
	for (const route of routes) {
		for (let index = 1; index < route.points.length; index += 1) {
			connect(graph, key(route.points[index - 1]), key(route.points[index]));
		}
	}
	connect(graph, keyPair(bridgeApproaches[0]), keyPair(bridgeApproaches[1]));
	return graph;
}

function connect(graph, first, second) {
	if (!graph.has(first)) graph.set(first, new Set());
	if (!graph.has(second)) graph.set(second, new Set());
	graph.get(first).add(second);
	graph.get(second).add(first);
}

function traverse(graph, start) {
	const reached = new Set();
	const queue = start ? [start] : [];
	while (queue.length) {
		const current = queue.shift();
		if (reached.has(current)) continue;
		reached.add(current);
		queue.push(...graph.get(current));
	}
	return reached;
}

function maximumRouteGap(routes) {
	return Math.max(...routes.map((route) => maximumPointGap(route.points)));
}

function maximumPointGap(points) {
	let maximum = 0;
	for (let index = 1; index < points.length; index += 1) {
		const first = coordinate(points[index - 1]);
		const second = coordinate(points[index]);
		maximum = Math.max(maximum, Math.hypot(second.x - first.x, second.z - first.z));
	}
	return maximum;
}

function coordinate(point) {
	return Array.isArray(point) ? { x: point[0], z: point[1] } : point;
}

function key(point) {
	return `${point.x},${point.z}`;
}

function keyPair(point) {
	return `${point[0]},${point[1]}`;
}

function rounded(value) {
	return Number(value.toFixed(3));
}
