// B"H
import { objectCommands } from './objects.js';
import { particleCommands } from './particles.js';
import { portalCommands } from './portal.js';
import { radarCommands } from './radar.js';
import { terrainCommands } from './terrain.js';

/** B"H: The render list is now a seder, not a stampede. */
export function buildRenderList(world, time) {
  const commands = [];
  terrainCommands(commands, world);
  objectCommands(commands, world, time);
  particleCommands(commands, world);
  portalCommands(commands, world.player, time, world.input.pulse);
  if (world.sefirah >= 5) radarCommands(commands, world);
  return commands;
}
