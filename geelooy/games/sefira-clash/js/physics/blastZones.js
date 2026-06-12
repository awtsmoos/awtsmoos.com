import { beginRespawnDelay } from './respawn.js';

/**
 * B"H
 * Blast zones and overload judgment.
 *
 * Chapter 243: exile may come by leaving the sheet, or by becoming too wounded
 * for the pinball arena to keep pretending. Extreme damage plus violent motion
 * now opens a mercy blast so fighters do not live at impossible percentages.
 */
export function resolveBlast(f, map) {
  if (f.hidden || f.respawnTimer || f.dead) return;
  const b = map.bounds;
  const outside = !(f.x > b.left && f.x < b.right && f.y > b.top && f.y < b.bottom);
  const overloaded = overloadKo(f, b);
  if (!outside && !overloaded) return;
  loseStock(f, map, overloaded ? overloadEdge(f, b) : blastEdge(f, b));
}

export function forceBlast(f, map, edge = null) {
  if (f.hidden || f.respawnTimer || f.dead) return;
  loseStock(f, map, edge || overloadEdge(f, map.bounds));
}

export function attachBlastEvents(map, events) { map._events = events; }

function overloadKo(f, b) {
  if ((f.damage || 0) < 260) return false;
  const speed = Math.hypot(f.vx || 0, f.vy || 0);
  if ((f.damage || 0) > 420 && speed > 10) return true;
  if ((f.damage || 0) > 650) return true;
  const nearSide = Math.min(Math.abs(f.x - b.left), Math.abs(b.right - f.x)) < 190;
  const nearTop = Math.abs(f.y - b.top) < 210;
  return speed > 38 && (nearSide || nearTop || f.damage > 320);
}

function loseStock(f, map, edge) {
  f.stocks--;
  f.damage = 0;
  f.vx = 0;
  f.vy = 0;
  f.shield = f.stats.shield;
  f.attack = null;
  f.attackFrame = 0;
  f.rapidAttack = null;
  f.rapidAttackFrame = 0;
  f.stun = 0;
  f.chargeGlow = 0;
  emitBlastEvent(f, map, edge);
  if (f.stocks <= 0) { f.dead = true; f.hidden = true; return; }
  beginRespawnDelay(f, map);
}

function emitBlastEvent(f, map, edge) {
  map._events?.push?.({ type: 'fall', x: edge.x, y: edge.y, dirX: edge.dirX, dirY: edge.dirY, rawX: f.x, rawY: f.y, damage: 20, force: 72, color: f.human ? '#84f7ff' : '#ff8a6b', letter: 'נ', text: f.human ? 'YOU OUT' : 'OUT', human: !!f.human, actorId: f.id });
}

function overloadEdge(f, b) {
  const side = Math.sign(f.vx || f.x - centerX(b) || 1);
  if (Math.abs(f.vy || 0) > Math.abs(f.vx || 0) * 1.25 && f.vy < 0) return { x: clamp(f.x, b.left + 80, b.right - 80), y: b.top + 24, dirX: 0, dirY: -1 };
  return { x: side < 0 ? b.left + 24 : b.right - 24, y: clamp(f.y, b.top + 80, b.bottom - 80), dirX: side, dirY: 0 };
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

function centerX(b) { return (b.left + b.right) / 2; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
