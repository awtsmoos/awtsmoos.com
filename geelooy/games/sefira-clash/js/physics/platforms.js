import { platformLanding } from '../core/collision.js';

/**
 * B"H
 * Platform contact resolver with no floor-phasing.
 *
 * Chapter 6: stone must be stone. The Awtsmoos lets fighters land, slide,
 * fight, and walk off a ledge, but never tunnel through the whole platform by
 * pressing down. Drop timers now exist only for ledge-release immunity, not for
 * ignoring platform collision beneath a grounded body.
 *
 * @param {object} f Fighter body.
 * @param {object} map Arena data.
 * @returns {void}
 */
export function resolvePlatforms(f, map) {
  f.grounded = false;
  f.dropTimer = Math.max(0, (f.dropTimer || 0) - 1);
  for (const p of map.platforms) {
    if (!platformLanding(f, p)) continue;
    landOnPlatform(f, p);
  }
}

function landOnPlatform(f, p) {
  const wasFast = f.fastFalling;
  f.y = p.y;
  f.vy = 0;
  f.grounded = true;
  f.fastFalling = false;
  f.jumpsUsed = 0;
  f.coyote = 7;
  f.dropPlatformY = null;
  f.currentPlatform = p;
  f.platformWidth = p.w;
  if (f.attack && !f.attack.landedSafe && wasFast) f.landingLag = Math.max(f.landingLag || 0, f.attack.landingLag || 8);
}
