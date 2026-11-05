// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageRoads.js
 * @description Defines the authored road spine with physical widths and bridge elevation anchors.
 * The Awtsmoos carries each traveler through one continuous intention; Awtsmoos.com gives
 * every cobbled lane its true width and joins both banks to BRIDGE01's walkable deck.
 */

import { canonicalStoneBridgeDeckTopY } from './VillageStoneBridgeContract.js';

const BRIDGE_CENTER = Object.freeze({ x: 18, z: 7 });
const BRIDGE_WALKABLE_Y = canonicalStoneBridgeDeckTopY(BRIDGE_CENTER);
const westBridgeApproach = bridgeApproach(10.4);
const eastBridgeApproach = bridgeApproach(25.6);

const ROUTE_POINTS = Object.freeze({
	arrivalMain: [[0, 101], [-2, 88], [-5, 72], [-8, 55], [-11, 39], [-15, 27], [-20, 17], [-12, 13], [2, 10], westBridgeApproach],
	arrivalWestHomes: [[-5, 72], [-14, 64], [-24, 57]],
	arrivalEastHomes: [[-5, 72], [7, 64], [18, 58], [25, 55]],
	beisTerrace: [[-8, 55], [-19, 50], [-35, 45], [-44, 49]],
	riverfront: [[-8, 55], [-9, 45], [-9, 38], [-5, 36]],
	marketLoop: [[-20, 17], [-29, 18], [-38, 18], [-35, 10], [-26, 12], [-18, 5]],
	shulRise: [[-20, 17], [-25, 5], [-29, -9], [-34, -24], [-47, -17]],
	upperHomes: [[-34, -24], [-18, -43], [-8, -36], [1, -31], [10, -52], [26, -44]],
	eastBank: [eastBridgeApproach, [34, -4], [42, 12], [43, 25]],
	farmTerraces: [[43, 25], [43, 39], [36, 34], [51, 39], [50, 53]],
	waterfallPortal: [eastBridgeApproach, [29, -8], [36, -24], [47, -35], [52, -42], [56, -49]]
});

export const CANONICAL_ROAD_WIDTHS = Object.freeze({
	main: 5.8,
	residential: 3.6,
	service: 2.4
});

const ROUTE_WIDTH_CLASSES = Object.freeze({
	arrivalMain: 'main',
	arrivalWestHomes: 'residential',
	arrivalEastHomes: 'residential',
	beisTerrace: 'residential',
	riverfront: 'residential',
	marketLoop: 'main',
	shulRise: 'residential',
	upperHomes: 'residential',
	eastBank: 'residential',
	farmTerraces: 'service',
	waterfallPortal: 'service'
});

/** Returns immutable authored road routes with explicit physical widths. */
export function canonicalVillageRoadRoutes() {
	return Object.entries(ROUTE_POINTS).map(([id, coordinates]) => {
		const points = coordinates.map(coordinatePoint);
		const widthClass = ROUTE_WIDTH_CLASSES[id];
		return Object.freeze({
			foldedSegments: Object.freeze([]),
			id: `canonical-${id}`,
			pathfinding: Object.freeze({
				failed: false,
				maximumSampleGap: maximumGap(points),
				method: 'authored-canonical-corridor'
			}),
			points: Object.freeze(points),
			terminalDistances: Object.freeze({ from: 0, to: 0 }),
			width: CANONICAL_ROAD_WIDTHS[widthClass],
			widthClass
		});
	});
}

/** Returns stable diagnostics for the connected village road graph. */
export function canonicalRoadNetworkEvidence() {
	const routes = canonicalVillageRoadRoutes();
	return Object.freeze({
		bridgeApproaches: Object.freeze([[10.4, 7], [25.6, 7]]),
		bridgeWalkableY: BRIDGE_WALKABLE_Y,
		connected: true,
		method: 'canonical-master-plan-authored-corridors',
		routeCount: routes.length,
		routeIds: Object.freeze(routes.map((route) => route.id))
	});
}

function bridgeApproach(x) {
	return Object.freeze([x, BRIDGE_CENTER.z, BRIDGE_WALKABLE_Y]);
}

function coordinatePoint([x, z, minimumHeight]) {
	return Object.freeze(Number.isFinite(minimumHeight)
		? { minimumHeight, x, z }
		: { x, z });
}

function maximumGap(points) {
	let maximum = 0;
	for (let index = 1; index < points.length; index += 1) {
		maximum = Math.max(maximum, Math.hypot(
			points[index].x - points[index - 1].x,
			points[index].z - points[index - 1].z
		));
	}
	return maximum;
}
