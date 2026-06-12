/**
 * B"H
 * Human prediction.
 *
 * Chapter 118: no chess engine, no oracle. Just the same glance a player has:
 * he is moving left, falling, or rising, so meet him a half-second ahead.
 */
export function humanPrediction(target, frames = 24) {
  const vx = target.vx || 0;
  const vy = target.vy || 0;
  const gravity = 0.72;
  const x = target.x + vx * frames;
  const y = target.y + vy * frames + 0.5 * gravity * frames * frames;
  return { x, y, frames, dir: Math.sign(vx || target.face || 1), speed: Math.hypot(vx, vy), falling: vy > 1.2, rising: vy < -1.2 };
}
