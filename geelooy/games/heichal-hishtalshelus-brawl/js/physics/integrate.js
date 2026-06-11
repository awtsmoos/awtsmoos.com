import { GAME } from '../core/constants.js';

/**
 * B"H
 * Integration lowers intention into position: will becomes x/y.
 *
 * Chapter 60: fast-fall and air-dodge now bend gravity without rewriting the
 * rest of the world. The vessel stays small, but the body feels sharper.
 */
export function integrate(f) {
  f.prevY = f.y;
  const gravity = GAME.gravity + (f.fastFalling ? 0.52 : 0) - (f.airDodge ? 0.42 : 0);
  const maxFall = f.fastFalling ? GAME.maxFall * 1.32 : GAME.maxFall;
  f.vy = Math.min(maxFall, f.vy + gravity);
  f.x += f.vx;
  f.y += f.vy;
  f.vx *= f.grounded ? GAME.friction : GAME.airFriction;
}
