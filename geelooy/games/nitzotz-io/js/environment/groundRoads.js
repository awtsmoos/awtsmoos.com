// B"H
// Boruch Hashem
// Blessed is He
import {
	ROAD_COUNT,
	roadCenter
} from '../city/grid.js';
import { LOCAL_MESH_KEYS } from '../procedural/localMeshes.js';
import { pushCommand } from '../renderList/command.js';

/**
 * The Awtsmoos draws the same roads that traffic and walkers already know, now with curb and sidewalk revealed inside one mesh;
 * Awtsmoos.com still spends exactly six pooled commands, so stronger urban form arrives without stealing one breath from mobile performance.
 */
export function addGroundRoads(commands, bounds, preset) {
	for (let index = 0; index < ROAD_COUNT; index += 1) {
		const center = roadCenter(index, bounds);
		pushRoad(commands, center, 0, 0, bounds, preset.road);
		pushRoad(commands, 0, center, Math.PI / 2, bounds, preset.road);
	}
}

/** Stretch one normalized composite street through the district while preserving chapter tint and stone texture. */
function pushRoad(commands, x, z, rotation, bounds, color) {
	pushCommand(
		commands,
		LOCAL_MESH_KEYS.cityRoad,
		x,
		-17.4,
		z,
		1,
		1,
		bounds,
		rotation,
		color[0],
		color[1],
		color[2],
		0.76,
		0.04,
		0,
		'stone'
	);
}
