// B"H
import { quality } from '../performance.js';
import { shadow, cmd } from './command.js';
import { visibleObjects } from './culling.js';

const DIRECT = new Set(['sphere', 'ring', 'cylinder', 'star', 'letter', 'arch', 'gate', 'cloud', 'tree', 'cube']);

/** B"H: Extra rings appear only while the frame has room to sing. */
export function objectCommands(commands, world, time) {
  const q = quality(world);
  for (const object of visibleObjects(world)) addObject(commands, object, 1, time, false, q);
  for (const object of world.absorbers) addObject(commands, object, object.life / 0.65, time, true, q);
}

function addObject(commands, object, fade, time, wobble, q) {
  const rare = object.sparks > 250;
  const pulse = wobble ? 1 + 0.14 * Math.sin(time * 18 + object.id) : 1 + (rare ? 0.035 * Math.sin(time * 3 + object.id) : 0);
  const y = object.z + object.h * 0.5 + (1 - fade) * 110;
  const rot = object.rot + (wobble ? (1 - fade) * 8 : time * 0.08 * (rare ? 1 : 0));
  const radius = Math.max(object.sx, object.sz) * 0.9;
  if (q > 0.48) shadow(commands, object.x, object.y, object.z, radius, 0.22 * fade);
  commands.push(cmd(meshName(object.shape), [object.x, y, object.y], [object.sx * pulse, object.h * 0.5 * pulse, object.sz * pulse], rot, object.color, 0.96 * fade, rare ? 0.28 : 0.11));
  if (rare && q > 0.74) commands.push(cmd('ring', [object.x, object.z + object.h + 10, object.y], [radius * 1.15, radius * 1.15, radius * 1.15], -time * 1.8, object.color, 0.18 * fade, 0.55));
}

function meshName(shape) {
  return DIRECT.has(shape) ? shape : 'cube';
}
