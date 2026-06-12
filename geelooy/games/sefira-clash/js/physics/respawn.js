/**
 * B"H
 * Respawn covenant.
 *
 * Chapter 19: exile receives a visible pause. The fighter does not instantly
 * reappear as if nothing happened. First the blast speaks, then the countdown
 * burns, then the soul returns with mercy frames.
 */
export function beginRespawnDelay(f, map) {
  const p = respawnPoint(f, map);
  f.respawnTimer = f.human ? 88 : 62;
  f.respawnPoint = { x: p.x, y: p.y - 160 };
  f.hidden = true;
  f.grounded = false;
  f.ledgeHang = null;
  f.attack = null;
  f.attackFrame = 0;
}

export function stepRespawns(state) {
  for (const f of state.fighters) {
    if (!f.respawnTimer || f.dead) continue;
    f.respawnTimer--;
    if (f.respawnTimer > 0) continue;
    const p = f.respawnPoint || respawnPoint(f, state.map);
    f.x = p.x;
    f.y = p.y;
    f.vx = 0;
    f.vy = 0;
    f.hidden = false;
    f.respawnGrace = 105;
    f.jumpsUsed = 0;
    f.dropTimer = 0;
    f.noLedgeTimer = 18;
  }
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
