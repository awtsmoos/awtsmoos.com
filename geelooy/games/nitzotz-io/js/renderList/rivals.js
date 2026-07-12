// B"H
import { addHole } from './portal.js';

/** Paint every rival hole from the same visual grammar as the player. */
export function rivalCommands(commands, world, time) {
	for (const rival of world.rivals) addHole(commands, rival, rival.color, time, false, false);
}
