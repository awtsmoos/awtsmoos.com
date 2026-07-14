// B"H
// Boruch Hashem
// Blessed is He
import { beginCommandFrame, endCommandFrame } from './command.js';
import { objectCommands } from './objects.js';
import { particleCommands } from './particles.js';
import { peerCommands } from './peers.js';
import { portalCommands } from './portal.js';
import { rivalCommands } from './rivals.js';
import { terrainCommands } from './terrain.js';

/**
 * The Awtsmoos orders one visible procession inside reusable command vessels.
 * The command array itself also survives every frame, preventing avoidable garbage.
 */
export function buildRenderList(world, time) {
	const commands = world.renderCommands || (world.renderCommands = []);
	commands.length = 0;
	beginCommandFrame();
	try {
		terrainCommands(commands, world, time);
		objectCommands(commands, world, time);
		rivalCommands(commands, world, time);
		peerCommands(commands, world, time);
		portalCommands(commands, world, time);
		particleCommands(commands, world);
		return commands;
	} finally {
		endCommandFrame();
	}
}
