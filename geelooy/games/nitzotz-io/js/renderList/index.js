// B"H
import { objectCommands } from './objects.js';
import { particleCommands } from './particles.js';
import { portalCommands } from './portal.js';
import { radarCommands } from './radar.js';
import { terrainCommands } from './terrain.js';

/** B"H: The render list is a living seder under the 60fps governor. */
export function buildRenderList(world, time) {
  const commands = [];
  terrainCommands(commands, world);
  objectCommands(commands, world, time);
  particleCommands(commands, world);
  portalCommands(commands, world, time);
  if (world.sefirah >= 5 && (world.performance?.scale ?? 1) > 0.55) radarCommands(commands, world);
  return commands;
}
