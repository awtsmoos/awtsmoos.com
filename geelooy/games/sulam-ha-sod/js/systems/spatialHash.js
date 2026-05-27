// B"H
/**
 * Chapter 34: the world stopped asking every stone every question.
 * A spatial hash divides the dream into little courts, so collisions summon
 * only nearby witnesses; the Awtsmoos makes speed by revealing locality.
 */
export class SpatialHash {
  /** @param {number} cellSize width/height of each spatial court */
  constructor(cellSize=160){ this.cellSize = cellSize; this.cells = new Map(); }
  /** Clear all indexed bodies. */
  clear(){ this.cells.clear(); }
  /** @param {object} body rectangle with x/y/w/h */
  keys(body){
    const a = Math.floor(body.x / this.cellSize), b = Math.floor((body.x + body.w) / this.cellSize);
    const c = Math.floor(body.y / this.cellSize), d = Math.floor((body.y + body.h) / this.cellSize);
    const out = [];
    for(let x=a;x<=b;x++) for(let y=c;y<=d;y++) out.push(`${x}:${y}`);
    return out;
  }
  /** @param {object} body rectangle to index */
  add(body){ for(const key of this.keys(body)){ if(!this.cells.has(key)) this.cells.set(key, []); this.cells.get(key).push(body); } }
  /** @param {Array<object>} bodies static or dynamic rectangles */
  build(bodies){ this.clear(); for(const body of bodies) this.add(body); return this; }
  /** @param {object} area rectangle query @returns {Array<object>} nearby unique bodies */
  query(area){
    const seen = new Set(), out = [];
    for(const key of this.keys(area)) for(const body of this.cells.get(key) || []) if(!seen.has(body)){ seen.add(body); out.push(body); }
    return out;
  }
}
