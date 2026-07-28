// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicSceneData
 * @description
 * Sky, ground, paths, houses, trees, lamps, and the moving character become one
 * ordered frame consumed identically by WebGL and fallback renderers.
 */

import {
	addCharacterGeometry,
	addHouseGeometry,
	addLampGeometry,
	addPathGeometry,
	addTreeGeometry
} from './NleCinematicObjectGeometry.js';
import {
	characterAt,
	createVillageProjection,
	rectangle
} from './NleCinematicProjection.js';
import {
	colorValue,
	expose,
	resolveCinematicPalette
} from './NleWebGlPalette.js';

export function createCinematicSceneFrame(project, asset, time, duration, width, height) {
	const resolved = resolveCinematicPalette(project);
	const palette = Object.fromEntries(Object.entries(resolved.materials).map(([id, color]) => [id, expose(colorValue(color), resolved.atmosphere.exposure)]));
	const projectPoint = createVillageProjection(width, height, time, duration);
	const triangles = [
		...rectangle(0, 0, width, height * .62, colorValue(resolved.atmosphere.skyTop)),
		...rectangle(0, height * .42, width, height * .3, colorValue(resolved.atmosphere.skyBottom)),
		...rectangle(0, height * .61, width, height * .39, colorValue('#263528'))
	];
	for (const path of asset.world.paths || []) addPathGeometry(triangles, path, projectPoint, palette[path.material]);
	const objects = [
		...(asset.world.houses || []).map(value => ({ kind: 'house', value, z: value.z })),
		...(asset.world.trees || []).map(value => ({ kind: 'tree', value, z: value.z })),
		...(asset.world.lamps || []).map(value => ({ kind: 'lamp', value, z: value.z }))
	].sort((first, second) => first.z - second.z);
	for (const object of objects) {
		if (object.kind === 'house') addHouseGeometry(triangles, object.value, projectPoint, palette);
		if (object.kind === 'tree') addTreeGeometry(triangles, object.value, projectPoint, palette, resolved.atmosphere.wind, time);
		if (object.kind === 'lamp') addLampGeometry(triangles, object.value, projectPoint, palette);
	}
	const position = characterAt(asset.world.character?.path, time / Math.max(.001, duration));
	addCharacterGeometry(triangles, position, projectPoint, palette);
	return { atmosphere: resolved.atmosphere, palette, projectPoint, triangles };
}
