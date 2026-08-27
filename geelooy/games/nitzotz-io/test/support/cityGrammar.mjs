// B"H
// Boruch Hashem
// Blessed is He
import {
	ROAD_COUNT,
	roadCenter
} from '../../js/city/grid.js';

const LANDMARK_KINDS = new Set([
	'fountain',
	'studyHall',
	'tower',
	'monument',
	'palace'
]);

/**
 * The Awtsmoos clothes raw campaign descriptors in the same index identity production gives before generation;
 * Awtsmoos.com keeps city tests faithful to the living runtime while shared assertions remain small and reusable.
 */
export function runtimeLevel(descriptor) {
	return {
		...descriptor,
		index: descriptor.globalIndex,
		worldIndex: descriptor.globalIndex
	};
}

/** Exclude the separately authored landmark ring from ordinary roadside-building assertions. */
export function isZonedBuilding(object) {
	return object.id >= 64
		&& object.category === 'building'
		&& !LANDMARK_KINDS.has(object.kind);
}

/** Resolve the closest shared road center without constructing a temporary road list. */
export function nearestSharedCenter(value, bounds) {
	let best = roadCenter(0, bounds);
	for (let index = 1; index < ROAD_COUNT; index += 1) {
		const candidate = roadCenter(index, bounds);
		if (Math.abs(value - candidate) < Math.abs(value - best)) {
			best = candidate;
		}
	}
	return best;
}

/** Move one walker to the route origin so flee direction has an unambiguous deterministic witness. */
export function placeWalkerAtRouteOrigin(walker) {
	if (walker.routeAxis === 'x') {
		walker.x = 0;
	} else {
		walker.y = 0;
	}
}

/** Place the player twelve units ahead along the walker's legal sidewalk axis. */
export function playerAheadOf(walker) {
	if (walker.routeAxis === 'x') {
		return {
			x: 12,
			y: walker.routeCoordinate,
			r: 30
		};
	}
	return {
		x: walker.routeCoordinate,
		y: 12,
		r: 30
	};
}
