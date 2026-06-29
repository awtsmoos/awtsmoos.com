// B"H
import { shadow, cmd } from './command.js';
import { visibleObjects } from './culling.js';

const DIRECT = new Set(['sphere', 'ring', 'cylinder', 'star', 'letter', 'arch', 'gate', 'cloud', 'tree', 'cube']);

/** B"H: Objects are chosen, spaced, and never allowed to swallow the lens. */
export function objectCommands(commands, world, time) {
  for (const object of visibleObjects(world)) addObject(commands, object, 1, time);
  for (const object of world.absorbers) addObject(commands, object, object.life / 0.65, time, true);
}

function addObject(commands, object, fade, time, wobble = false) {
  const pulse = wobble ? 1 + 0.12 * Math.sin(time * 18 + object.id) : 1;
  const y = object.z + object.h * 0.5 + (1 - fade) * 95;
  const rot = object.rot + (wobble ? (1 - fade) * 7 : 0);
  const radius = Math.max(object.sx, object.sz) * 0.82;
  shadow(commands, object.x, object.y, object.z, radius, 0.18 * fade);
  commands.push(cmd(meshName(object.shape), [object.x, y, object.y], [object.sx * pulse, object.h * 0.5 * pulse, object.sz * pulse], rot, object.color, 0.94 * fade, 0.12));
}

function meshName(shape) {
  return DIRECT.has(shape) ? shape : 'cube';
}
