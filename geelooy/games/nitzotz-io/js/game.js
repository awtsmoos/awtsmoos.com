// B"H
import { updateCamera } from './camera/rig.js';
import { updateLevelStream } from './level.js';
import { movePlayer } from './game/movement.js';
import { absorbObjects } from './game/absorption.js';
import { resolveHazards } from './game/hazards.js';
import { animateEffects } from './game/effects.js';
import { lose, nextWorld, restart, start, upgrades, win } from './game/progression.js';

export { nextWorld, restart, start };

/** One frame of gameplay: movement, danger, absorption, growth, then camera. */
export function step(world, dt) {
  const safeDt = Math.min(0.05, dt);
  if (world.mode !== 'playing') return updateCamera(world, safeDt);
  movePlayer(world, safeDt);
  updateLevelStream(world.level, world.player.x, world.player.y);
  resolveHazards(world, safeDt);
  absorbObjects(world, safeDt);
  animateEffects(world, safeDt);
  upgrades(world);
  updateCamera(world, safeDt);
  world.timeLeft -= safeDt * world.level.clock;
  if (world.score >= world.level.target) win(world);
  if (world.timeLeft <= 0 && !world.won) lose(world);
}
