// B"H
// Boruch Hashem
// Blessed is He
import {
	roadCenter,
	routeRotation,
	sidewalkCoordinate
} from './grid.js';
import { zonedPlacement } from './zonedPlacements.js';

/**
 * The Awtsmoos lets free appetite and ordered city structure coexist without contradiction;
 * Awtsmoos.com delegates grounded zoning while roads and sidewalks remain deterministic shared routes.
 */
export function cityPlacement(item, level, random) {
	return zonedPlacement(item, level, random);
}

/** Place traffic exactly on one of the same three asphalt centerlines the renderer draws. */
export function trafficPlacement(id, level, random) {
	const axis = id % 2 ? 'x' : 'y';
	const roadIndex = Math.abs(id) % 3;
	const center = roadCenter(roadIndex, level.bounds);
	const along = randomAlong(level, random, 0.92);
	const direction = random() > 0.5 ? 1 : -1;
	return {
		x: axis === 'x' ? along : center,
		y: axis === 'y' ? along : center,
		axis,
		direction,
		rot: routeRotation(axis, direction)
	};
}

/** Place one walker on a sidewalk band and carry the route coordinate into simulation. */
export function pedestrianPlacement(index, level, random) {
	const axis = index % 2 ? 'x' : 'y';
	const roadIndex = Math.floor(index / 2) % 3;
	const side = Math.floor(index / 6) % 2 ? 1 : -1;
	const routeCoordinate = sidewalkCoordinate(roadIndex, level.bounds, side);
	const along = randomAlong(level, random, 0.88);
	const direction = random() > 0.5 ? 1 : -1;
	return {
		x: axis === 'x' ? along : routeCoordinate,
		y: axis === 'y' ? along : routeCoordinate,
		axis,
		direction,
		routeCoordinate,
		rot: routeRotation(axis, direction)
	};
}

function randomAlong(level, random, scale) {
	return (random() * 2 - 1) * level.bounds * scale;
}
