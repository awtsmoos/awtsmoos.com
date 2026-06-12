/**
 * B"H
 * Blast zones judge exile and scatter respawns across the level.
 *
 * Chapter 161: falling now speaks. A fighter crossing the boundary triggers a
 * feedback event before returning to a different spawn or vanishing from stocks.
 */
export function resolveBlast(f, map) {
  const b = map.bounds;
  if (f.x > b.left && f.x < b.right && f.y > b.top && f.y < b.bottom) return;
  f.lastBlastEvent ||= null;
  f.stocks--;
  f.damage = 0;
  f.vx = 0;
  f.vy = 0;
  f.shield = f.stats.shield;
  f.attack = null;
  f.attackFrame = 0;
  f.stun = 0;
  f.chargeGlow = 0;
  map._events?.push?.({ type: 'fall', x: f.x, y: f.y, damage: 20, force: 28, color: '#ff8a6b', letter: 'נפילה' });
  if (f.stocks <= 0) { f.dead = true; return; }
  const p = respawnPoint(f, map);
  f.x = p.x;
  f.y = p.y - 160;
  f.grounded = false;
  f.jumpsUsed = 0;
  f.dropTimer = 0;
  f.respawnGrace = 90;
}

export function attachBlastEvents(map, events) {
  map._events = events;
}

function respawnPoint(f, map) {
  const spawns = map.spawns?.length ? map.spawns : [{ x: 0, y: 0 }];
  const hash = hashId(f.id || f.name || 'fighter');
  const index = Math.abs(hash + (3 - (f.stocks || 0)) * 3) % spawns.length;
  return spawns[index];
}

function hashId(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return h;
}
