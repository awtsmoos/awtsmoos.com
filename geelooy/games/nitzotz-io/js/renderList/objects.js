// B"H
import { quality } from '../performance.js';
import { shadow, cmd } from './command.js';
import { visibleObjects } from './culling.js';

const DIRECT = new Set(['sphere', 'ring', 'cylinder', 'star', 'letter', 'arch', 'gate', 'cloud', 'tree', 'cube']);

/**
 * B"H
 * The Awtsmoos lets the suction storm sparkle, not flood. Visible objects keep
 * their measured procession; absorber echoes are sorted and capped so pulse joy
 * stays bright without becoming a wall of draw calls.
 */
export function objectCommands(commands, world, time) {
  const q = quality(world);
  for (const object of visibleObjects(world)) addObject(commands, object, 1, time, false, q);
  for (const object of visibleAbsorbers(world, q)) addObject(commands, object, object.life / 0.65, time, true, q);
}

function visibleAbsorbers(world, q) {
  const max = Math.max(10, Math.floor(34 * q));
  return [...world.absorbers]
    .filter(object => object.life > 0.08)
    .sort((a, b) => b.life + b.sparks * 0.001 - (a.life + a.sparks * 0.001))
    .slice(0, max);
}

function addObject(commands, object, fade, time, wobble, q) {
  const rare = object.sparks > 250;
  const pulse = wobble ? 1 + 0.14 * Math.sin(time * 18 + object.id) : 1 + (rare ? 0.035 * Math.sin(time * 3 + object.id) : 0);
  const y = object.z + object.h * 0.5 + (1 - fade) * 110;
  const rot = object.rot + (wobble ? (1 - fade) * 8 : time * 0.08 * (rare ? 1 : 0));
  const radius = Math.max(object.sx, object.sz) * 0.9;
  if (shouldShadow(rare, wobble, q, fade)) shadow(commands, object.x, object.y, object.z, radius, shadowAlpha(rare, wobble, fade));
  commands.push(cmd(meshName(object.shape), [object.x, y, object.y], [object.sx * pulse, object.h * 0.5 * pulse, object.sz * pulse], rot, object.color, 0.96 * fade, rare ? 0.28 : 0.11));
  if (rare && q > 0.74) commands.push(cmd('ring', [object.x, object.z + object.h + 10, object.y], [radius * 1.15, radius * 1.15, radius * 1.15], -time * 1.8, object.color, 0.18 * fade, 0.55));
}

function shouldShadow(rare, wobble, q, fade) {
  if (wobble) return q > 0.72 && fade > 0.28;
  return rare && q > 0.68;
}

function shadowAlpha(rare, wobble, fade) {
  const base = rare ? 0.24 : wobble ? 0.16 : 0.12;
  return base * fade;
}

function meshName(shape) {
  return DIRECT.has(shape) ? shape : 'cube';
}
