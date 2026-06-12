import { beginRespawnDelay } from './respawn.js';

/**
 * B"H
 * Blast zones judge exile with visible directional thunder.
 *
 * Chapter 29: the explosion no longer appears far beyond the camera's witness.
 * The Awtsmoos pins the KO burst to the nearest blast-edge boundary, so when a
 * fighter leaves the sheet, the border itself erupts with the direction of loss.
 */
export function resolveBlast(f, map) {
  if (f.hidden || f.respawnTimer || f.dead) return;
  const b = map.bounds;
  if (f.x > b.left && f.x < b.right && f.y > b.top && f.y < b.bottom) return;
  f.stocks--;
  f.damage = 0;
  f.vx = 0;
  f.vy = 0;
  f.shield = f.stats.shield;
  f.attack = null;
  f.attackFrame = 0;
  f.stun = 0;
  f.chargeGlow = 0;
  emitBlastEvent(f, map);
  if (f.stocks <= 0) { f.dead = true; f.hidden = true; return; }
  beginRespawnDelay(f, map);
}

export function attachBlastEvents(map, events) { map._events = events; }

function emitBlastEvent(f, map) {
  const edge = blastEdge(f, map.bounds);
  map._events?.push?.({
    type: 'fall',
    x: edge.x,
    y: edge.y,
    dirX: edge.dirX,
    dirY: edge.dirY,
    rawX: f.x,
    rawY: f.y,
    damage: 20,
    force: 72,
    color: f.human ? '#84f7ff' : '#ff8a6b',
    letter: 'נ',
    text: f.human ? 'YOU OUT' : 'OUT',
    human: !!f.human,
    actorId: f.id
  });
}

function blastEdge(f, b) {
  const edges = [
    { x: b.left + 24, y: clamp(f.y, b.top + 80, b.bottom - 80), dirX: -1, dirY: 0, v: Math.abs(f.x - b.left) },
    { x: b.right - 24, y: clamp(f.y, b.top + 80, b.bottom - 80), dirX: 1, dirY: 0, v: Math.abs(f.x - b.right) },
    { x: clamp(f.x, b.left + 80, b.right - 80), y: b.top + 24, dirX: 0, dirY: -1, v: Math.abs(f.y - b.top) },
    { x: clamp(f.x, b.left + 80, b.right - 80), y: b.bottom - 24, dirX: 0, dirY: 1, v: Math.abs(f.y - b.bottom) }
  ];
  return edges.sort((a, z) => a.v - z.v)[0] || edges[3];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
