/**
 * B"H
 * Landing predictor.
 *
 * Chapter 51: only the landing is foretold. The Awtsmoos does not ask the bot
 * to dream a thousand futures; it asks where the feet are likely to touch the
 * earth, then lets the fighter stand there and strike.
 */
export function predictLanding(target, platforms) {
  if (target.grounded) return { active: false, x: target.x, y: target.y, frames: 0, platform: null };
  const gravity = 0.72;
  let x = target.x;
  let y = target.y;
  let vy = target.vy || 0;
  for (let frame = 1; frame <= 90; frame++) {
    x += target.vx || 0;
    y += vy;
    vy += gravity;
    const p = platformUnder(x, y, platforms);
    if (p && vy > 0) return { active: true, x: clamp(x, p.x + 55, p.x + p.w - 55), y: p.y, frames: frame, platform: p };
  }
  return { active: true, x, y, frames: 90, platform: null };
}

function platformUnder(x, y, platforms) {
  for (const p of platforms || []) {
    if (x >= p.x - 20 && x <= p.x + p.w + 20 && y >= p.y - 20 && y <= p.y + 65) return p;
  }
  return null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
