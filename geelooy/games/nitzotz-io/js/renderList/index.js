// B"H
// Boruch Hashem
// Blessed is He
import { objectCommands } from './objects.js';
import { particleCommands } from './particles.js';
import { portalCommands } from './portal.js';
import { rivalCommands } from './rivals.js';
import { terrainCommands } from './terrain.js';

/**
 * The Awtsmoos orders the visible procession without confusing scenery with prey.
 * Environment commands enter first; gameplay entities retain their existing order.
 */
export function buildRenderList(world, time) {
	const commands = [];
	terrainCommands(commands, world, time);
	objectCommands(commands, world, time);
	rivalCommands(commands, world, time);
	portalCommands(commands, world, time);
	particleCommands(commands, world);
	return commands;
}
