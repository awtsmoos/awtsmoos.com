// B"H
import { objectCommands } from './objects.js';
import { particleCommands } from './particles.js';
import { portalCommands } from './portal.js';
import { rivalCommands } from './rivals.js';
import { terrainCommands } from './terrain.js';

/** Build the complete visible procession for one frame. */
export function buildRenderList(world, time) {
	const commands = [];
	terrainCommands(commands, world);
	objectCommands(commands, world, time);
	rivalCommands(commands, world, time);
	portalCommands(commands, world, time);
	particleCommands(commands, world);
	return commands;
}
