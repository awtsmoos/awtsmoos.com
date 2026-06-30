// B"H
import { clamp, heightAt, len, mix, norm } from '../math.js';

/** Move the player with clean normalized input and pulse acceleration. */
export function movePlayer(world, dt) {
  const player = world.player;
  const vector = norm(world.input);
  const magnitude = clamp(len(world.input.x, world.input.y), 0, 1);
  const pulseSurge = world.input.pulse > 0 ? 1.18 + world.sefirah * 0.045 : 1;
  player.x += vector.x * player.speed * magnitude * pulseSurge * dt;
  player.y += vector.y * player.speed * magnitude * pulseSurge * dt;
  player.x = clamp(player.x, -world.level.bounds, world.level.bounds);
  player.y = clamp(player.y, -world.level.bounds, world.level.bounds);
  player.z = heightAt(player.x, player.y, world.level.worldIndex);
  coolDownInput(world, dt);
}

function coolDownInput(world, dt) {
  const player = world.player;
  world.input.pulse = Math.max(0, world.input.pulse - dt);
  player.glow = Math.max(0, player.glow - dt * 1.25);
  player.comboT = Math.max(0, player.comboT - dt);
  if (!player.comboT) player.combo = mix(player.combo, 1, dt * 2);
}
