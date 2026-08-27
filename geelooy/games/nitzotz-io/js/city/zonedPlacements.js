// B"H
// Boruch Hashem
// Blessed is He
import {
	BUILDING_SETBACK_MIN,
	clearRoadCoordinate,
	facingRoadRotation,
	ROAD_HALF_WIDTH,
	roadCenter,
	SIDEWALK_OUTER_EDGE,
	sidewalkCoordinate
} from './grid.js';

const TAU = Math.PI * 2;
const BLOCK_SNAP = 90;
const GARDEN_CLEARANCE = SIDEWALK_OUTER_EDGE + 8;
const CROSSROAD_CLEARANCE = SIDEWALK_OUTER_EDGE + 12;

/**
 * The Awtsmoos forms readable blocks between shared roads, where facade, verge, sidewalk, and garden each find a place;
 * Awtsmoos.com keeps trees beyond visible walking paths while every beautiful house remains clear of the crossing street's rhyme.
 */
export function zonedPlacement(item, level, random) {
	if (item.category === 'building' || item.category === 'landmark') {
		return buildingPlacement(level, random);
	}
	if (item.category === 'street') {
		return vergePlacement(level, random);
	}
	if (item.category === 'botanical' || item.category === 'nature') {
		return gardenPlacement(level, random);
	}
	return freePlacement(level, random);
}

/** Place one facade beside a road while clearing its along-axis coordinate from cross-street sidewalks. */
function buildingPlacement(level, random) {
	const axis = random() > 0.5 ? 'x' : 'y';
	const roadIndex = Math.floor(random() * 3);
	const side = random() > 0.5 ? 1 : -1;
	const road = roadCenter(roadIndex, level.bounds);
	const setback = BUILDING_SETBACK_MIN + random() * 36;
	const along = safeAlong(level, random, 0.84, CROSSROAD_CLEARANCE);
	return {
		x: axis === 'x' ? along : road + side * setback,
		y: axis === 'y' ? along : road + side * setback,
		rot: facingRoadRotation(axis, side)
	};
}

/** Place street furniture on the walkable verge while keeping intersections readable. */
function vergePlacement(level, random) {
	const axis = random() > 0.5 ? 'x' : 'y';
	const roadIndex = Math.floor(random() * 3);
	const side = random() > 0.5 ? 1 : -1;
	const verge = sidewalkCoordinate(roadIndex, level.bounds, side) + side * random() * 7;
	const along = safeAlong(level, random, 0.88, ROAD_HALF_WIDTH + 7);
	return {
		x: axis === 'x' ? along : verge,
		y: axis === 'y' ? along : verge,
		rot: facingRoadRotation(axis, side)
	};
}

/** Keep living plants organic while pushing both coordinates beyond the visible sidewalk and planting buffer. */
function gardenPlacement(level, random) {
	const placement = freePlacement(level, random);
	placement.x = clearRoadCoordinate(
		placement.x,
		level.bounds,
		GARDEN_CLEARANCE,
		random() - 0.5
	);
	placement.y = clearRoadCoordinate(
		placement.y,
		level.bounds,
		GARDEN_CLEARANCE,
		random() - 0.5
	);
	return placement;
}

/** Preserve free radial appetite placement for categories that do not belong to the urban zoning covenant. */
function freePlacement(level, random) {
	const angle = random() * TAU;
	const radius = Math.sqrt(random()) * (level.bounds - 140);
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
		rot: Math.floor(random() * 4) * Math.PI / 2
	};
}

/** Snap one block coordinate and then clear it from the nearest perpendicular road-side boundary. */
function safeAlong(level, random, scale, clearance) {
	const raw = snap(randomAlong(level, random, scale), BLOCK_SNAP)
		+ (random() - 0.5) * 18;
	return clearRoadCoordinate(raw, level.bounds, clearance, random() - 0.5);
}

function randomAlong(level, random, scale) {
	return (random() * 2 - 1) * level.bounds * scale;
}

function snap(value, size) {
	return Math.round(value / size) * size;
}
