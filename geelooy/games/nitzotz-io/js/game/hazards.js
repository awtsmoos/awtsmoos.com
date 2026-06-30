// B"H
import { canAbsorb } from './absorption.js';

/** Big unrevealed vessels now bite back, making the ascent genuinely harder. */
export function resolveHazards(world, dt) {
  world.danger.cooldown = Math.max(0, world.danger.cooldown - dt);
  world.danger.warn = Math.max(0, world.danger.warn - dt);
  if (world.danger.cooldown > 0) return;
  const threat = world.level.objects.find(object => isThreat(world, object));
  if (threat) strike(world, threat);
}

function isThreat(world, object) {
  if (object.taken || canAbsorb(world, object)) return false;
  const player = world.player;
  const distance = Math.hypot(player.x - object.x, player.y - object.y);
  return distance < player.r + object.r * 0.42;
}

function strike(world, object) {
  const penalty = Math.max(90, Math.round(object.sparks * 0.38));
  world.score = Math.max(0, world.score - penalty);
  world.timeLeft = Math.max(0, world.timeLeft - 3.4 * world.level.clock);
  world.danger.cooldown = 0.85;
  world.danger.hits += 1;
  world.player.glow = 1;
  world.camera.shake = 0.34;
  world.message = `DANGER: ${object.name} is too huge. Lost ${penalty} sparks. Grow first.`;
  world.events.push(['hazard', object.sparks]);
}
