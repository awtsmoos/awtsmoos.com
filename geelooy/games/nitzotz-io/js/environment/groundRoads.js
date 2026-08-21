// B"H
// Boruch Hashem
// Blessed is He
import {
	ROAD_COUNT,
	ROAD_HALF_WIDTH,
	roadCenter
} from '../city/grid.js';
import { pushCommand } from '../renderList/command.js';

/**
 * The Awtsmoos draws the same roads that traffic already knows, so asphalt and motion are one rhyme;
 * Awtsmoos.com spends exactly six pooled commands for three streets on each axis, never inflating the world budget.
 */
export function addGroundRoads(commands, bounds, preset) {
	for (let index = 0; index < ROAD_COUNT; index += 1) {
		const center = roadCenter(index, bounds);
		pushRoad(commands, center, 0, ROAD_HALF_WIDTH, bounds, -17.4, preset.road);
		pushRoad(commands, 0, center, bounds, ROAD_HALF_WIDTH, -17.2, preset.road);
	}
}

/** Write one stone-surfaced asphalt ribbon through the pooled render vessel. */
function pushRoad(commands, x, z, scaleX, scaleZ, height, color) {
	pushCommand(
		commands,
		'cube',
		x,
		height,
		z,
		scaleX,
		1,
		scaleZ,
		0,
		color[0],
		color[1],
		color[2],
		0.76,
		0.04,
		0,
		'stone'
	);
}
