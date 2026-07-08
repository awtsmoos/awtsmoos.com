// B"H
/**
 * @file SpatialInterestRegistry.js
 * A lightweight spatial-interest registry: not a physics octree, but a cheap
 * awareness vessel so missions, NPCs, and animals can avoid global scans.
 */
import { classifyInterestTier } from './InterestTierScheduler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
function posOf(v = {}) { return v.position || v.mesh?.position || v.object3D?.position || v; }
function cellKey(p = {}, size) { return `${Math.floor((p.x || 0) / size)}:${Math.floor((p.z || 0) / size)}`; }
export function createSpatialInterestRegistry(options = {}) {
  const cellSize = Number(options.cellSize || 64);
  const entries = new Map();
  const cells = new Map();
  function addToCell(id, p) {
    const key = cellKey(p, cellSize);
    if (!cells.has(key)) cells.set(key, new Set());
    cells.get(key).add(id);
    return key;
  }
  function register(id, object, kind = 'entity') {
    if (!id) throw new Error('SpatialInterestRegistry requires an id.');
    const p = posOf(object);
    const entry = { id, kind, object, position:p, cell:addToCell(id, p), interest:null, updatedAt:Date.now() };
    entries.set(id, entry);
    return entry;
  }
  function unregister(id) {
    const entry = entries.get(id);
    if (entry?.cell) cells.get(entry.cell)?.delete(id);
    entries.delete(id);
  }
  function refresh(id) {
    const entry = entries.get(id);
    if (!entry) return null;
    const p = posOf(entry.object);
    const next = cellKey(p, cellSize);
    if (next !== entry.cell) {
      cells.get(entry.cell)?.delete(id);
      entry.cell = addToCell(id, p);
    }
    entry.position = p;
    entry.updatedAt = Date.now();
    return entry;
  }
  function classifyAll(player, policy = {}) {
    const out = { near:[], mid:[], far:[], horizon:[] };
    for (const id of entries.keys()) {
      const entry = refresh(id);
      entry.interest = classifyInterestTier(entry, player, policy);
      out[entry.interest.tier].push(entry);
    }
    return out;
  }
  function nearby(player, radius = 180) {
    const p = posOf(player);
    const span = Math.ceil(radius / cellSize);
    const cx = Math.floor((p.x || 0) / cellSize);
    const cz = Math.floor((p.z || 0) / cellSize);
    const found = [];
    for (let x = cx - span; x <= cx + span; x += 1) for (let z = cz - span; z <= cz + span; z += 1) for (const id of cells.get(`${x}:${z}`) || []) found.push(refresh(id));
    return found.filter(Boolean);
  }
  function report() { return { entries:entries.size, cells:cells.size, kinds:[...new Set([...entries.values()].map(e => e.kind))] }; }
  return { register, unregister, refresh, classifyAll, nearby, report, entries, cells };
}
export default createSpatialInterestRegistry;
