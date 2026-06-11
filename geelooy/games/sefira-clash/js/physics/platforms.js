import { platformLanding } from '../core/collision.js';

/**
 * B"H
 * Platform contact resolver.
 *
 * Chapter 61: when feet touch stone, the body remembers earth. Jumps reset,
 * fast-fall ends, and landing lag only appears after committed aerial violence.
 */
export function resolvePlatforms(f, map) {
  f.grounded = false;
  for (const p of map.platforms) {
    if (!platformLanding(f, p)) continue;
    const wasFast = f.fastFalling;
    f.y = p.y;
    f.vy = 0;
    f.grounded = true;
    f.fastFalling = false;
    f.jumpsUsed = 0;
    f.coyote = 7;
    if (f.attack && !f.attack.landedSafe && wasFast) f.landingLag = Math.max(f.landingLag || 0, f.attack.landingLag || 8);
  }
}
