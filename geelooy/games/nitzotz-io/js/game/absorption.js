// B"H
import { addText } from '../state.js';
import { suctionStep } from '../engine/physics.js';

/** Absorb all vessels that are small enough; pull them during pulse. */
export function absorbObjects(world, dt) {
  for (const object of world.level.objects) tryAbsorb(world, object, dt);
}

/** Decide whether one object can be revealed by the player vessel. */
export function canAbsorb(world, object) {
  const boost = world.sefirah >= 2 ? 1.23 : 1.02;
  return object.r < world.player.r * boost;
}

function tryAbsorb(world, object, dt) {
  if (object.taken) return;
  const player = world.player;
  if (world.input.pulse > 0 && canAbsorb(world, object)) suctionStep(object, player, dt, world.level.worldIndex, 0.9 + world.sefirah * 0.22);
  if (canAbsorb(world, object) && Math.hypot(player.x - object.x, player.y - object.y) < player.r * 0.9) reveal(world, object);
}

function reveal(world, object) {
  object.taken = true;
  world.absorbers.push({ ...object, life: 0.65, ox: object.x, oy: object.y });
  const player = world.player;
  player.combo = world.sefirah >= 3 ? Math.min(6, player.combo + 0.18) : Math.max(1, player.combo);
  player.comboT = 3.2;
  const gain = Math.round(object.sparks * player.combo);
  world.score += gain;
  player.r += Math.sqrt(object.sparks) * 0.21;
  player.h = player.r * 1.42;
  player.speed = Math.max(260, player.speed - object.sparks * 0.0032);
  player.glow = 1;
  world.camera.shake = 0.2;
  addText(world, object.x, object.y, object.z + object.h, `+${gain} x${player.combo.toFixed(1)}`);
  world.message = `${object.hood}: ${object.name} +${gain}. Keep moving.`;
  world.events.push(['reveal', object.sparks]);
}
