/**
 * B"H
 * Combat sense with real hit-volume awareness.
 *
 * Chapter 220: far above is not hittable; it is a chase. The bot may jump
 * toward it, but it may not start punching until the vertical lane enters true
 * anti-air range. Thus the fist waits for contact instead of blessing empty sky.
 */
export function combatSense(bot, target) {
  const dx = target.x - bot.x;
  const dy = target.y - bot.y;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const dist = Math.hypot(dx, dy * 0.75);
  const facing = Math.sign(dx || bot.face || 1);
  const sameFightingLane = absY < 125;
  const antiAirLane = dy < -70 && dy > -185 && absX < 205;
  const aboveLane = dy <= -125 && absX < 340;
  const belowLane = dy >= 125 && absX < 340;
  const reachableGround = sameFightingLane && absX < 260;
  const reachableClose = sameFightingLane && absX < 105;
  const airborneReach = !bot.grounded && absX < 210 && absY < 170;
  const vulnerable = !!target.attack || target.stun > 0 || target.damage > 85;
  const canHitNow = reachableGround || antiAirLane || airborneReach;
  return {
    dx, dy, absX, absY, dist, facing, vulnerable,
    sameFightingLane, antiAirLane, aboveLane, belowLane, reachableGround, reachableClose, airborneReach, canHitNow,
    close: reachableGround && dist < 130,
    mid: reachableGround && dist >= 105 && dist < 285,
    killPercent: target.damage > 115,
    shouldGrab: reachableClose && !target.attack && bot.grounded,
    shouldRapid: reachableClose,
    shouldSmash: reachableGround && dist > 85 && dist < 255 && vulnerable,
    shouldAntiAir: antiAirLane,
    shouldChaseVertical: !canHitNow && absX < 340 && absY >= 125
  };
}
