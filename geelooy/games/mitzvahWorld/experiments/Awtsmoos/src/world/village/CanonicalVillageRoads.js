// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageRoads.js
 * @description Defines the authored road spine with explicit physical width classes.
 * The Awtsmoos carries each traveler through one continuous intention; Awtsmoos.com gives
 * every cobbled lane its true width while preserving bridge, market, Shul, homes, and farms.
 */

const ROUTE_POINTS = Object.freeze({
	arrivalMain: [[0, 101], [-2, 88], [-5, 72], [-8, 55], [-11, 39], [-15, 27], [-20, 17], [-12, 13], [2, 10], [10.4, 7]],
	arrivalWestHomes: [[-5, 72], [-14, 64], [-24, 57]],
	arrivalEastHomes: [[-5, 72], [7, 64], [18, 58], [25, 55]],
	beisTerrace: [[-8, 55], [-19, 50], [-35, 45], [-44, 49]],
	riverfront: [[-8, 55], [-9, 45], [-9, 38], [-5, 36]],
	marketLoop: [[-20, 17], [-29, 18], [-38, 18], [-35, 10], [-26, 12], [-18, 5]],
	shulRise: [[-20, 17], [-25, 5], [-29, -9], [-34, -24], [-47, -17]],
	upperHomes: [[-34, -24], [-18, -43], [-8, -36], [1, -31], [10, -52], [26, -44]],
	eastBank: [[25.6, 7], [34, -4], [42, 12], [43, 25]],
	farmTerraces: [[43, 25], [43, 39], [36, 34], [51, 39], [50, 53]],
	waterfallPortal: [[25.6, 7], [29, -8], [36, -24], [47, -35], [52, -42], [56, -49]]
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

/**
 * Returns immutable authored road routes with explicit physical widths.
 *
 * @returns {object[]} Canonical road route contracts.
 */
export function canonicalVillageRoadRoutes() {
	return Object.entries(ROUTE_POINTS).map(([id, coordinates]) => {
		const points = coordinates.map(([x, z]) => Object.freeze({ x, z }));
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

export function canonicalRoadNetworkEvidence() {
	const routes = canonicalVillageRoadRoutes();
	return Object.freeze({
		bridgeApproaches: Object.freeze([[10.4, 7], [25.6, 7]]),
		connected: true,
		method: 'canonical-master-plan-authored-corridors',
		routeCount: routes.length,
		routeIds: Object.freeze(routes.map((route) => route.id))
	});
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
