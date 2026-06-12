import { clamp } from '../core/vectors.js';

/**
 * B"H
 * Air control and fast fall.
 *
 * Chapter 184: airborne movement must feel like Melee wind. The player can
 * drift hard, fast-fall deliberately, and recover horizontally instead of
 * floating helplessly through a slow dream.
 */
export function applyAirControl(f, input) {
  if (f.grounded) return;
  const drift = f.hatStats?.airDrift || 1;
  const max = (f.stats.maxSpeed || 10) * 1.06 * drift;
  f.vx = clamp(f.vx + (input.x || 0) * f.stats.air * 1.45 * drift, -max, max);
  f.fastFalling = input.y > 0.45 || input.down;
  if (f.fastFalling && f.vy > -2) f.vy += 1.15;
}

export function applyAirDodge(f, input) {
  f.dodgeCooldown = Math.max(0, (f.dodgeCooldown || 0) - 1);
  f.airDodge = Math.max(0, (f.airDodge || 0) - 1);
  if (f.grounded || !input.shield || f.dodgeCooldown > 0) return;
  const x = input.x || f.face || 1;
  f.vx = x * 13;
  f.vy = (input.y || 0) * 7 - 2;
  f.airDodge = 15;
  f.dodgeCooldown = 72;
}
