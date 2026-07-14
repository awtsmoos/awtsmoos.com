// B"H
// Boruch Hashem
// Blessed is He
import { objectMaterial } from '../materials/objectMaterials.js';
import { clamp, heightAt, hsl, TAU } from '../math.js';
import { modelVariantKey } from '../modelKey.js';
import { LOCAL_MESH_KEYS } from '../procedural/localMeshes.js';
import { itemDefinition } from './items.js';

const LANES = [-0.36, -0.18, 0, 0.18, 0.36];

/**
 * The Awtsmoos clothes one campaign record in shape, material, reward, and route.
 * Every simulation field remains explicit while surface policy stays centralized.
 */
export function makeArenaObject(id, kind, level, random, placement) {
	const item = itemDefinition(kind);
	const noise = 0.9 + random() * 0.22;
	const x = clamp(placement.x, -level.bounds + 90, level.bounds - 90);
	const y = clamp(placement.y, -level.bounds + 90, level.bounds - 90);
	return {
		id,
		kind,
		name: item.label,
		category: item.category,
		power: item.power || null,
		model: item.model || null,
		shape: shapeForItem(kind, item, id),
		material: objectMaterial(kind, item.category, item.model),
		grounded: Boolean(item.model),
		x,
		y,
		z: heightAt(x, y, level.index),
		r: item.r * noise,
		h: item.h * noise,
		mx: item.meshScale[0] * noise,
		my: item.meshScale[1] * noise,
		mz: item.meshScale[2] * noise,
		mass: item.mass * noise,
		sparks: Math.round(item.sparks * noise),
		rot: placement.rot,
		color: hsl(level.hue + id * 13 + item.mass, 72, 58),
		district: districtFor(x, y),
		traffic: Boolean(item.traffic),
		routeAxis: placement.axis || null,
		routeDirection: placement.direction || 0,
		speed: item.traffic ? 70 + random() * 85 : 0,
		taken: false,
		sink: 0,
		sinkOwner: null,
		locked: false
	};
}

/** Place one ordinary item while buildings remain aligned to readable city blocks. */
export function cityPlacement(item, level, random) {
	const angle = random() * TAU;
	const radius = Math.sqrt(random()) * (level.bounds - 140);
	let x = Math.cos(angle) * radius;
	let y = Math.sin(angle) * radius;
	if (item.category === 'building' || item.category === 'landmark') {
		x = snap(x, 180) + (random() - 0.5) * 46;
		y = snap(y, 180) + (random() - 0.5) * 46;
	}
	return { x, y, rot: Math.floor(random() * 4) * Math.PI / 2 };
}

/** Place one traffic item along a deterministic lane and travel direction. */
export function trafficPlacement(id, level, random) {
	const axis = id % 2 ? 'x' : 'y';
	const lane = LANES[id % LANES.length] * level.bounds;
	const along = (random() * 2 - 1) * level.bounds * 0.92;
	const direction = random() > 0.5 ? 1 : -1;
	return {
		x: axis === 'x' ? along : lane,
		y: axis === 'y' ? along : lane,
		axis,
		direction,
		rot: 0
	};
}

function shapeForItem(kind, item, id) {
	if (kind === 'stone') return LOCAL_MESH_KEYS.stone;
	if (kind === 'scroll') return LOCAL_MESH_KEYS.scroll;
	return item.model ? modelVariantKey(item.model, id) : item.shape;
}

function districtFor(x, y) {
	return `${x >= 0 ? 'E' : 'W'}${y >= 0 ? 'S' : 'N'}`;
}

function snap(value, size) {
	return Math.round(value / size) * size;
}
