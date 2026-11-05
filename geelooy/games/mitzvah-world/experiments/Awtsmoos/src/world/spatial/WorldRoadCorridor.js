// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRoadCorridor.js
 * @description Makes authored road width and signed road-edge clearance one cached shared world contract.
 * The Awtsmoos creates highway and footpath without confusing their measures; Awtsmoos.com lets every finite route keep its own breadth,
 * while canonical route solving happens once per deferred world load instead of once for every reed, stone, camera, or staging query.
 */

import { canonicalRoadSurfaceRoutes } from '../CanonicalRoadSurfaceNetwork.js';
import { freezePoint, nearestPointOnPolylineXZ } from './WorldSpatialMath.js';

export const DEFAULT_ROAD_WIDTH = 5.8;

const CANONICAL_ROAD_ROUTES = Object.freeze(canonicalRoadSurfaceRoutes());

export function resolveRoadRouteWidth(route, fallbackWidth = DEFAULT_ROAD_WIDTH) {
	const authored = Number(route?.width);
	if (Number.isFinite(authored) && authored > 0) return authored;
	const fallback = Number(fallbackWidth);
	if (Number.isFinite(fallback) && fallback > 0) return fallback;
	throw new Error('Road corridor requires a positive authored or fallback width.');
}

export function roadCorridorEvidenceAt(point, options = {}) {
	const routes = options.routes || CANONICAL_ROAD_ROUTES;
	const margin = Math.max(0, Number(options.margin) || 0);
	let best = null;
	for (const route of routes) {
		const nearest = nearestPointOnPolylineXZ(point, route.points);
		if (!nearest) continue;
		const width = resolveRoadRouteWidth(route, options.fallbackWidth);
		const evidence = corridorEvidence(route, nearest, width, margin);
		if (!best || evidence.clearance < best.clearance) best = evidence;
	}
	return best;
}

export function roadTerminalJunctions(
	routes = CANONICAL_ROAD_ROUTES,
	fallbackWidth = DEFAULT_ROAD_WIDTH
) {
	const terminals = new Map();
	for (const route of routes) {
		const width = resolveRoadRouteWidth(route, fallbackWidth);
		for (const point of [route.points?.[0], route.points?.at?.(-1)]) {
			if (!point) continue;
			const key = `${point.x.toFixed(3)},${point.z.toFixed(3)}`;
			const current = terminals.get(key) || {
				point: freezePoint(point),
				routeIds: new Set(),
				width: 0
			};
			current.routeIds.add(route.id);
			current.width = Math.max(current.width, width);
			terminals.set(key, current);
		}
	}
	return Object.freeze([...terminals.values()].map(value => Object.freeze({
		point: value.point,
		routeIds: Object.freeze([...value.routeIds].sort()),
		width: value.width
	})));
}

export function canonicalRoadCorridorRoutes() {
	return CANONICAL_ROAD_ROUTES;
}

function corridorEvidence(route, nearest, width, margin) {
	const edgeClearance = nearest.distance - width / 2;
	const clearance = edgeClearance - margin;
	return Object.freeze({
		clearance,
		distanceToCenterline: nearest.distance,
		edgeClearance,
		halfWidth: width / 2,
		inside: edgeClearance <= 0,
		nearestPoint: nearest.point,
		routeId: route.id,
		segmentIndex: nearest.segmentIndex,
		segmentT: nearest.segmentT,
		sourceId: route.id,
		surfaceTag: route.surfaceTag || route.role || null,
		width,
		widthClass: route.widthClass || null,
		withinMargin: clearance <= 0
	});
}
