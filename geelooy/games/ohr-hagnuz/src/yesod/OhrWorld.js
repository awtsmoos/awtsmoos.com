/**
 * B"H
 * @module OhrWorld
 * @description Tile, portal, path, NPC-facing, and zone-theme helpers.
 *
 * Chapter 192: The path learned respect. The Awtsmoos has no body and no form,
 * yet a player should not walk into a teacher to hear a teaching. Clicking an
 * NPC now resolves to an adjacent approach tile; if already adjacent, the hero
 * simply turns to face the soul and the mission remains clear.
 */
import { State } from '../binah/State.js';
import { WorldData, Portals, tileMeta, isPassableGlyph } from '../data/WorldData.js';
import { PathVisualizer } from '../chochmah/PathVisualizer.js';
import { discoverZoneRoute } from './codex/TorahCodexRuntime.js';

export const tileAt = (x, y, mapId = State.MapId) => {
  const map = WorldData[mapId];
  if (!map || y < 0 || y >= map.length) return null;
  const row = map[y] || '';
  return x < 0 || x >= row.length ? null : row[x];
};

export const metaAt = (x, y, mapId = State.MapId) => tileMeta(tileAt(x, y, mapId));
export const mapSize = (mapId = State.MapId) => ({ w: Math.max(0, ...(WorldData[mapId] || []).map(row => row.length)), h: (WorldData[mapId] || []).length });
export const canPass = (x, y) => { const glyph = tileAt(x, y); return glyph !== null && isPassableGlyph(glyph); };

export const portalAt = (x, y, glyph = tileAt(x, y)) => {
  const meta = tileMeta(glyph);
  const list = Portals[State.MapId] || [];
  if (meta.kind === 'door') return list.find(p => p.x === x && p.y === y && (!p.glyph || p.glyph === glyph));
  if (meta.kind === 'edge') return list.find(p => p.edge === meta.edge);
  return null;
};

export const edgePortal = (x, y) => {
  const size = mapSize();
  const edge = y < 0 ? 'N' : y >= size.h ? 'S' : x < 0 ? 'W' : x >= size.w ? 'E' : null;
  return edge ? (Portals[State.MapId] || []).find(p => p.edge === edge) : null;
};

export const transfer = portal => {
  State.MapId = portal.to;
  State.resetHero(portal.spawn.x, portal.spawn.y, State.Hero.dir);
  PathVisualizer.clear();
  const zone = discoverZoneRoute(portal.to);
  State.Story.chapter = Math.max(State.Story.chapter || 1, zone.act || 1);
  State.say(`${portal.message || `Entered ${portal.to}.`} Zone: ${zone.name}; ${zone.mood}.`);
};

export const faceTile = (x, y) => {
  const H = State.Hero;
  const dx = x - H.cx;
  const dy = y - H.cy;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
  H.dir = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u';
  State.clearPath();
  PathVisualizer.clear();
  return true;
};

export const findPath = (sx, sy, tx, ty) => {
  if (sx === tx && sy === ty) return [];
  if (!canPass(tx, ty)) return null;
  const queue = [{ x: sx, y: sy, path: [] }];
  const visited = new Set([`${sx},${sy}`]);
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  while (queue.length) {
    const cur = queue.shift();
    if (cur.x === tx && cur.y === ty) return cur.path;
    for (const [dx, dy] of dirs) {
      const x = cur.x + dx;
      const y = cur.y + dy;
      const key = `${x},${y}`;
      if (visited.has(key) || !canPass(x, y)) continue;
      visited.add(key);
      queue.push({ x, y, path: [...cur.path, { x, y }] });
    }
    if (visited.size > 2600) break;
  }
  return null;
};

const approachOptions = (x, y) => [[0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dy]) => ({ x: x + dx, y: y + dy, dx, dy })).filter(p => canPass(p.x, p.y));
const isPresence = meta => meta.kind === 'npc' || meta.kind === 'musag';

const pathToPresence = (x, y) => {
  if (faceTile(x, y)) return [];
  let best = null;
  for (const p of approachOptions(x, y)) {
    const path = findPath(State.Hero.cx, State.Hero.cy, p.x, p.y);
    if (path && (!best || path.length < best.path.length)) best = { ...p, path };
  }
  if (!best) return null;
  State.PathTarget = { x, y, valid: true, faceOnly: true, approach: { x: best.x, y: best.y } };
  return best.path;
};

export const setPathTo = (x, y) => {
  if (State.isUiBlocking()) return null;
  const targetMeta = metaAt(x, y);
  const path = isPresence(targetMeta) ? pathToPresence(x, y) : findPath(State.Hero.cx, State.Hero.cy, x, y);
  if (path && path.length === 0) {
    State.HeroPath = [];
    if (!isPresence(targetMeta)) State.PathTarget = null;
    PathVisualizer.clear();
    State.say(isPresence(targetMeta) ? `Facing ${targetMeta.label || 'guide'}. Press Talk.` : 'Already standing there.', 120);
    return path;
  }
  if (!isPresence(targetMeta)) State.PathTarget = { x, y, valid: path !== null };
  State.HeroPath = path || [];
  if (path === null) PathVisualizer.showBlocked(x, y);
  State.say(path !== null ? (isPresence(targetMeta) ? `Approaching ${targetMeta.label || 'guide'}.` : `Walking to ${x}, ${y}.`) : `No open path to ${x}, ${y}.`, 180);
  return path;
};
