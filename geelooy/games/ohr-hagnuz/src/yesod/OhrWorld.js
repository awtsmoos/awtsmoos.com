/**
 * B"H
 * @module OhrWorld
 * Tile, portal, and path helpers for the active lightweight runtime.
 */
import { State } from '../binah/State.js';
import { WorldData, Portals, tileMeta, isPassableGlyph } from '../data/WorldData.js';

export const tileAt = (x, y, mapId = State.MapId) => {
  const map = WorldData[mapId];
  if (!map || y < 0 || y >= map.length) return null;
  const row = map[y] || '';
  return x < 0 || x >= row.length ? null : row[x];
};

export const metaAt = (x, y, mapId = State.MapId) => tileMeta(tileAt(x, y, mapId));

export const mapSize = (mapId = State.MapId) => {
  const map = WorldData[mapId] || [];
  return { w: Math.max(...map.map(row => row.length)), h: map.length };
};

export const canPass = (x, y) => {
  const glyph = tileAt(x, y);
  return glyph !== null && isPassableGlyph(glyph);
};

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

export const transfer = (portal) => {
  State.MapId = portal.to;
  State.resetHero(portal.spawn.x, portal.spawn.y, State.Hero.dir);
  State.PathTarget = null;
  State.say(portal.message || `Entered ${portal.to}.`);
};

export const findPath = (sx, sy, tx, ty) => {
  if (!canPass(tx, ty)) return null;
  const queue = [{ x: sx, y: sy, path: [] }];
  const visited = new Set([`${sx},${sy}`]);
  const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
  while (queue.length) {
    const cur = queue.shift();
    if (cur.x === tx && cur.y === ty) return cur.path;
    for (const [dx, dy] of dirs) {
      const x = cur.x + dx, y = cur.y + dy, key = `${x},${y}`;
      if (visited.has(key) || !canPass(x, y)) continue;
      visited.add(key);
      queue.push({ x, y, path: [...cur.path, { x, y }] });
    }
    if (visited.size > 2200) break;
  }
  return null;
};

export const setPathTo = (x, y) => {
  const path = findPath(State.Hero.cx, State.Hero.cy, x, y);
  State.PathTarget = { x, y, valid: !!path };
  State.HeroPath = path || [];
  State.say(path ? `Walking to ${x}, ${y}.` : `No open path to ${x}, ${y}.`, 180);
  return path;
};
