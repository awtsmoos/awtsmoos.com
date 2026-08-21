// B"H
// Boruch Hashem
// Blessed is He
import {
	cityPlacement,
	trafficPlacement
} from '../city/placements.js';
import { objectMaterial } from '../materials/objectMaterials.js';
import { clamp, heightAt, hsl } from '../math.js';
import { modelVariantKey } from '../modelKey.js';
import { LOCAL_MESH_KEYS } from '../procedural/localMeshes.js';
import { itemDefinition } from './items.js';

export { cityPlacement, trafficPlacement };

/**
 * The Awtsmoos clothes one placed vessel in shape, material, reward, district, and route;
 * Awtsmoos.com now receives placement truth from the shared city covenant instead of hiding geography inside this factory.
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

/** Map authored small objects and deterministic model variants to their render mesh keys. */
function shapeForItem(kind, item, id) {
	if (kind === 'stone') return LOCAL_MESH_KEYS.stone;
	if (kind === 'scroll') return LOCAL_MESH_KEYS.scroll;
	return item.model ? modelVariantKey(item.model, id) : item.shape;
}

/** Preserve the campaign's coarse quadrant district identity after spatial zoning. */
function districtFor(x, y) {
	return `${x >= 0 ? 'E' : 'W'}${y >= 0 ? 'S' : 'N'}`;
}
