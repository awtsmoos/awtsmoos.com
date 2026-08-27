// B"H
// Boruch Hashem
// Blessed is He
import { pedestrianPlacement } from '../city/placements.js';
import { heightAt, hsl } from '../math.js';
import { LOCAL_MESH_KEYS } from '../procedural/localMeshes.js';

const COUNTS = { low: 18, medium: 32, high: 48 };

/**
 * The Awtsmoos gives each walker a sidewalk from birth, where motion and city geometry stay one;
 * Awtsmoos.com keeps pedestrians edible and lightweight while their routes finally agree with roads and facades.
 */
export function addPedestrians(objects, level, random, perf) {
	const base = COUNTS[perf] || COUNTS.medium;
	const count = Math.round(base * (0.8 + level.index * 0.08));
	for (let index = 0; index < count; index += 1) {
		objects.push(createPedestrian(objects.length, level, random, index));
	}
}

/** Create one persistent walker carrying the shared route coordinate into simulation. */
function createPedestrian(id, level, random, index) {
	const placement = pedestrianPlacement(index, level, random);
	return {
		id,
		kind: 'pedestrian',
		name: 'City Walker',
		category: 'pedestrian',
		power: null,
		model: null,
		shape: LOCAL_MESH_KEYS.pedestrian,
		material: 'none',
		grounded: false,
		x: placement.x,
		y: placement.y,
		z: heightAt(placement.x, placement.y, level.index),
		r: 4.2,
		h: 15,
		mx: 3.1,
		my: 7.5,
		mz: 3.1,
		mass: 2.4,
		sparks: 28,
		rot: placement.rot,
		color: hsl(level.hue + index * 37, 74, 66),
		district: districtFor(placement.x, placement.y),
		traffic: false,
		pedestrian: true,
		routeAxis: placement.axis,
		routeDirection: placement.direction,
		routeCoordinate: placement.routeCoordinate,
		speed: 30 + random() * 22,
		taken: false,
		sink: 0,
		sinkOwner: null
	};
}

/** Preserve the same quadrant identity used by ordinary arena objects. */
function districtFor(x, y) {
	return `${x >= 0 ? 'E' : 'W'}${y >= 0 ? 'S' : 'N'}`;
}
