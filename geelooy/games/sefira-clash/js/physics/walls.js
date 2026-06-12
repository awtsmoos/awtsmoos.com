/**
 * B"H
 * Swept wall and ceiling collision.
 *
 * Chapter 171: the chamber answers from every side. Fast bodies cannot tunnel;
 * side walls bounce horizontally, ceilings bounce downward, and high-speed
 * ricochets stay inside the arena until a real exit takes them.
 */
export function resolveWalls(f, state) {
  const walls = state.map.walls || [];
  if (!walls.length) return;
  const startX = f.prevX ?? (f.x - f.vx);
  const startY = f.prevY ?? f.y;
  const dx = f.x - startX;
  const dy = f.y - startY;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 14));
  let lastSafe = { x: startX, y: startY };
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const probe = { x: startX + dx * t, y: startY + dy * t };
    const hit = firstWallHit(probe, walls);
    if (!hit) { lastSafe = probe; continue; }
    bounceFromRect(f, state, hit, lastSafe);
    return;
  }
}

function firstWallHit(pos, walls) {
  const body = boundsFor(pos.x, pos.y);
  for (const wall of walls) {
    if (body.right > wall.x && body.left < wall.x + wall.w && body.bottom > wall.y && body.top < wall.y + wall.h) return wall;
  }
  return null;
}

function bounceFromRect(f, state, rect, safe) {
  const safeBody = boundsFor(safe.x, safe.y);
  if (safeBody.top >= rect.y + rect.h) return bounceVertical(f, state, rect, safe, 1);
  if (safeBody.bottom <= rect.y) return bounceVertical(f, state, rect, safe, -1);
  const fromLeft = safe.x < rect.x + rect.w / 2;
  bounceHorizontal(f, state, rect, safe, fromLeft ? -1 : 1);
}

function bounceHorizontal(f, state, rect, safe, side) {
  f.x = side < 0 ? rect.x - 29 : rect.x + rect.w + 29;
  f.y = safe.y;
  const speed = Math.max(8, Math.abs(f.vx));
  f.vx = side * Math.min(34, speed * 0.86 + f.damage * 0.035);
  f.vy *= 0.72;
  impact(f, state, speed, 'קיר', side);
}

function bounceVertical(f, state, rect, safe, dir) {
  f.x = safe.x;
  f.y = dir > 0 ? rect.y + rect.h + 171 : rect.y - 7;
  const speed = Math.max(8, Math.abs(f.vy));
  f.vy = dir * Math.min(30, speed * 0.78 + f.damage * 0.025);
  f.vx *= 0.78;
  impact(f, state, speed, dir > 0 ? 'תקרה' : 'רצפה', 0);
}

function impact(f, state, speed, letter, side) {
  f.stun = Math.max(f.stun || 0, Math.min(20, 5 + speed * 0.25));
  state.events.push({ type: 'wall', x: f.x, y: f.y - 92, damage: Math.round(speed), force: speed, color: '#c8fff1', letter, side });
  state.hitstop = Math.max(state.hitstop || 0, speed > 16 ? 3 : 1);
}

function boundsFor(x, y) {
  return { left: x - 28, right: x + 28, top: y - 170, bottom: y + 6 };
}
