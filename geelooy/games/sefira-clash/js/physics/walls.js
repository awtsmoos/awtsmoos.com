/**
 * B"H
 * Swept bouncy wall and ceiling collision with player-local event metadata.
 *
 * Chapter 273: walls may sing for every ricochet, but only the human body may
 * ask the phone to tremble. Each wall event now carries actorId and human truth.
 */
export function resolveWalls(f, state) {
  const walls = state.map.walls || [];
  if (!walls.length) return;
  const startX = f.prevX ?? (f.x - f.vx);
  const startY = f.prevY ?? f.y;
  const dx = f.x - startX;
  const dy = f.y - startY;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 12));
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
  f.x = side < 0 ? rect.x - 31 : rect.x + rect.w + 31;
  f.y = safe.y;
  const speed = Math.max(10, Math.abs(f.vx));
  f.vx = side * Math.min(72, speed * 1.06 + f.damage * 0.05);
  f.vy = preserveTangential(f.vy, 0.94);
  impact(f, state, speed, 'קיר', side);
}

function bounceVertical(f, state, rect, safe, dir) {
  f.x = safe.x;
  f.y = dir > 0 ? rect.y + rect.h + 173 : rect.y - 8;
  const speed = Math.max(10, Math.abs(f.vy));
  f.vy = dir * Math.min(68, speed * 1.03 + f.damage * 0.045);
  f.vx = preserveTangential(f.vx, 0.94);
  impact(f, state, speed, dir > 0 ? 'תקרה' : 'רצפה', 0);
}

function preserveTangential(value, keep) {
  if (Math.abs(value) < 0.2) return value;
  return value * keep;
}

function impact(f, state, speed, letter, side) {
  f.stun = Math.max(f.stun || 0, Math.min(12, 2 + speed * 0.13));
  state.events.push({ type: 'wall', actorId: f.id, human: !!f.human, x: f.x, y: f.y - 92, damage: Math.round(speed), force: speed, color: '#c8fff1', letter, side });
  state.hitstop = Math.max(state.hitstop || 0, speed > 18 ? 2 : 1);
}

function boundsFor(x, y) {
  return { left: x - 28, right: x + 28, top: y - 170, bottom: y + 6 };
}
