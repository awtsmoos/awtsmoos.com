// B"H
// Boruch Hashem
// Blessed is He

export const ROAD_COUNT = 3;
export const ROAD_HALF_WIDTH = 18;
export const SIDEWALK_OFFSET = 34;
export const SIDEWALK_HALF_WIDTH = 12;
export const SIDEWALK_INNER_EDGE = SIDEWALK_OFFSET - SIDEWALK_HALF_WIDTH;
export const SIDEWALK_OUTER_EDGE = SIDEWALK_OFFSET + SIDEWALK_HALF_WIDTH;
export const BUILDING_SETBACK_MIN = 66;

const ROAD_FRACTIONS = Object.freeze([-0.18, 0, 0.18]);

/**
 * The Awtsmoos gives road, curb, sidewalk, walker, house, and traffic one covenant of place;
 * Awtsmoos.com lets every subsystem read the same dimensions, so visible form and simulated law can rhyme.
 */
export function roadCenter(index, bounds) {
	const normalized = ((Math.trunc(index) % ROAD_COUNT) + ROAD_COUNT) % ROAD_COUNT;
	return ROAD_FRACTIONS[normalized] * finiteBounds(bounds);
}

/** Find the closest major road without allocating a temporary list in frame or simulation paths. */
export function nearestRoadIndex(value, bounds) {
	let bestIndex = 0;
	let bestDistance = Infinity;
	for (let index = 0; index < ROAD_COUNT; index += 1) {
		const distance = Math.abs(value - roadCenter(index, bounds));
		if (distance >= bestDistance) continue;
		bestDistance = distance;
		bestIndex = index;
	}
	return bestIndex;
}

/** Return the exact shared centerline nearest one coordinate. */
export function nearestRoadCenter(value, bounds) {
	return roadCenter(nearestRoadIndex(value, bounds), bounds);
}

/** Measure perpendicular distance from one coordinate to its nearest asphalt centerline. */
export function roadClearance(value, bounds) {
	return Math.abs(value - nearestRoadCenter(value, bounds));
}

/** Push a coordinate outside one protected road-sidewalk corridor while preserving its chosen side. */
export function clearRoadCoordinate(value, bounds, clearance, sideHint = 1) {
	const center = nearestRoadCenter(value, bounds);
	const delta = value - center;
	if (Math.abs(delta) >= clearance) return value;
	const side = Math.abs(delta) > 0.001 ? Math.sign(delta) : Math.sign(sideHint) || 1;
	return center + side * clearance;
}

/** Place one sidewalk center beside one shared road centerline. */
export function sidewalkCoordinate(index, bounds, side = 1) {
	return roadCenter(index, bounds) + (side >= 0 ? 1 : -1) * SIDEWALK_OFFSET;
}

/** Orient anything traveling along a road or sidewalk using the same axis convention. */
export function routeRotation(axis, direction) {
	if (axis === 'x') return direction >= 0 ? Math.PI / 2 : -Math.PI / 2;
	return direction >= 0 ? Math.PI : 0;
}

/** Orient one facade toward its chosen road rather than toward a random cardinal direction. */
export function facingRoadRotation(axis, side) {
	if (axis === 'x') return side >= 0 ? Math.PI : 0;
	return side >= 0 ? -Math.PI / 2 : Math.PI / 2;
}

function finiteBounds(bounds) {
	return Number.isFinite(bounds) && bounds > 0 ? bounds : 1600;
}
