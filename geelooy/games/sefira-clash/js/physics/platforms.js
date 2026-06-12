import { platformLanding } from '../core/collision.js';

/**
 * B"H
 * Platform contact resolver with drop-through support.
 *
 * Chapter 116: not every platform is a prison. When a fighter requests a drop,
 * the stone lets them pass for a few frames so vertical chase becomes possible.
 */
export function resolvePlatforms(f, map) {
  f.grounded = false;
  f.dropTimer = Math.max(0, (f.dropTimer || 0) - 1);
  for (const p of map.platforms) {
    if (f.dropTimer > 0 && f.prevY <= p.y + 8) continue;
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
