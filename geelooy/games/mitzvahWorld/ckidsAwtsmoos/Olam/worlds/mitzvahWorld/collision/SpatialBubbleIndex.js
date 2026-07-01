// B"H
/**
 * @file SpatialBubbleIndex.js
 * @description Plain-number local spatial index for collision bubble layers.
 */

const DEFAULT_CELL_SIZE = 12;
const DEFAULT_LIMIT = 96;

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function keyOf(ix, iz) {
  return `${ix}:${iz}`;
}

function boundsCenter(bounds = {}) {
  const min = bounds.min || {};
  const max = bounds.max || {};
  return {
    x: (finite(min.x) + finite(max.x)) * 0.5,
    y: (finite(min.y) + finite(max.y)) * 0.5,
    z: (finite(min.z) + finite(max.z)) * 0.5
  };
}

function radiusOf(entry = {}) {
  if (Number.isFinite(Number(entry.radius))) return Math.max(0.05, Number(entry.radius));
  const bounds = entry.bounds;
  if (!bounds?.min || !bounds?.max) return Math.max(0.05, finite(entry.size, 1));
  const dx = finite(bounds.max.x) - finite(bounds.min.x);
  const dz = finite(bounds.max.z) - finite(bounds.min.z);
  return Math.max(0.05, Math.hypot(dx, dz) * 0.5);
}

function xzOf(entry = {}) {
  if (entry.bounds?.min && entry.bounds?.max) return boundsCenter(entry.bounds);
  return { x: finite(entry.x), y: finite(entry.y), z: finite(entry.z) };
}

export default class SpatialBubbleIndex {
  constructor(options = {}) {
    this.cellSize = Math.max(1, finite(options.cellSize, DEFAULT_CELL_SIZE));
    this.entries = new Map();
    this.cells = new Map();
    this.player = { x:0, z:0 };
    this.stats = {
      registered:0,
      removed:0,
      queries:0,
      candidates:0,
      capped:0,
      activeByLayer:{ 0:0, 1:0, 2:0, 3:0, 4:0 },
      lastQuery:null
    };
  }

  _cellRange(x, z, radius) {
    const r = Math.max(0, finite(radius));
    return {
      minX:Math.floor((x - r) / this.cellSize),
      maxX:Math.floor((x + r) / this.cellSize),
      minZ:Math.floor((z - r) / this.cellSize),
      maxZ:Math.floor((z + r) / this.cellSize)
    };
  }

  _keysFor(entry) {
    const { x, z } = xzOf(entry);
    const radius = radiusOf(entry);
    const range = this._cellRange(x, z, radius);
    const keys = [];
    for (let ix = range.minX; ix <= range.maxX; ix += 1) {
      for (let iz = range.minZ; iz <= range.maxZ; iz += 1) keys.push(keyOf(ix, iz));
    }
    return keys;
  }

  register(raw = {}) {
    const id = raw.id || `${raw.kind || "entry"}_${this.entries.size + 1}`;
    this.remove(id);
    const pos = xzOf(raw);
    const entry = {
      ...raw,
      id,
      x:pos.x,
      y:pos.y,
      z:pos.z,
      radius:radiusOf(raw),
      layer:Math.max(0, Math.min(4, Math.floor(finite(raw.layer, 1)))),
      dirty:false
    };
    entry._cellKeys = this._keysFor(entry);
    this.entries.set(id, entry);
    for (const key of entry._cellKeys) {
      let set = this.cells.get(key);
      if (!set) this.cells.set(key, set = new Set());
      set.add(id);
    }
    this.stats.registered += 1;
    return entry;
  }

  remove(id) {
    const entry = this.entries.get(id);
    if (!entry) return false;
    for (const key of entry._cellKeys || []) this.cells.get(key)?.delete(id);
    this.entries.delete(id);
    this.stats.removed += 1;
    return true;
  }

  updateEntry(id, patch = {}) {
    const old = this.entries.get(id);
    if (!old) return null;
    return this.register({ ...old, ...patch, id });
  }

  setPlayerPosition(x = 0, z = 0) {
    this.player.x = finite(x);
    this.player.z = finite(z);
  }

  queryCircle(x = 0, z = 0, radius = 1, filter = null, options = {}) {
    const limit = Math.max(1, Math.floor(finite(options.limit, DEFAULT_LIMIT)));
    const range = this._cellRange(finite(x), finite(z), finite(radius));
    const seen = new Set();
    const out = [];
    for (let ix = range.minX; ix <= range.maxX; ix += 1) {
      for (let iz = range.minZ; iz <= range.maxZ; iz += 1) {
        const set = this.cells.get(keyOf(ix, iz));
        if (!set) continue;
        for (const id of set) {
          if (seen.has(id)) continue;
          seen.add(id);
          const entry = this.entries.get(id);
          if (!entry) continue;
          const reach = radius + entry.radius;
          const d2 = (entry.x - x) ** 2 + (entry.z - z) ** 2;
          if (d2 > reach * reach) continue;
          if (filter && !filter(entry)) continue;
          out.push(entry);
          if (out.length >= limit) {
            this.stats.capped += 1;
            break;
          }
        }
        if (out.length >= limit) break;
      }
      if (out.length >= limit) break;
    }
    out.sort((a, b) => ((a.x - x) ** 2 + (a.z - z) ** 2) - ((b.x - x) ** 2 + (b.z - z) ** 2));
    this.stats.queries += 1;
    this.stats.candidates += out.length;
    this.stats.lastQuery = { x:finite(x), z:finite(z), radius:finite(radius), returned:out.length, seen:seen.size };
    this._refreshActiveByLayer();
    return out;
  }

  _refreshActiveByLayer() {
    const counts = { 0:0, 1:0, 2:0, 3:0, 4:0 };
    for (const entry of this.entries.values()) counts[entry.layer] = (counts[entry.layer] || 0) + 1;
    this.stats.activeByLayer = counts;
  }

  diag() {
    this._refreshActiveByLayer();
    return {
      cellSize:this.cellSize,
      entries:this.entries.size,
      cells:this.cells.size,
      player:{ ...this.player },
      ...this.stats,
      averageCandidates:this.stats.queries ? this.stats.candidates / this.stats.queries : 0
    };
  }
}
