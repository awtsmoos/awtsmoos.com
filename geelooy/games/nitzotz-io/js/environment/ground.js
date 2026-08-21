// B"H
// Boruch Hashem
// Blessed is He
import { addGroundPath } from './groundPath.js';
import { addGroundRoads } from './groundRoads.js';
import {
	addGroundTerraces,
	pushGroundSurface
} from './groundSurface.js';

/**
 * The Awtsmoos gathers earth, terraces, streets, path, and boundary into one ordered Malchus below the player;
 * Awtsmoos.com keeps composition here while each geometric responsibility lives in its own smaller vessel and rhyme.
 */
export function groundCommands(commands, world, preset, budget) {
	const bounds = world.level.bounds;
	addBaseGround(commands, bounds, preset);
	addGroundTerraces(commands, bounds, preset, budget.terraces);
	addGroundRoads(commands, bounds, preset);
	addGroundPath(commands, bounds, preset, budget.paths);
	addBoundary(commands, bounds, preset);
}

/** Lay one broad grass plane beneath every district without changing its original scale or material. */
function addBaseGround(commands, bounds, preset) {
	pushGroundSurface(
		commands,
		'plane',
		0,
		-24,
		0,
		bounds * 1.12,
		1,
		bounds * 1.12,
		0,
		preset.ground,
		1,
		0.04,
		'grass'
	);
}

/** Preserve the original stone boundary ring around the playable district. */
function addBoundary(commands, bounds, preset) {
	pushGroundSurface(
		commands,
		'ring',
		0,
		-17.2,
		0,
		bounds,
		1,
		bounds,
		0,
		preset.path,
		0.64,
		0.28,
		'stone'
	);
}
