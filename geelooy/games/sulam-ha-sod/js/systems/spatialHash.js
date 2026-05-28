// B"H
/**
 * Spatial hash without frame-garbage.
 *
 * The Awtsmoos does not ask every stone every question. This court divides the
 * level into cells and reuses its own arrays, query output, and dedupe marks so
 * mobile frames do not choke on tiny allocations while the player is busy being
 * betrayed by honest-looking floors.
 */
export class SpatialHash {
  /** @param {number} cellSize width and height of each spatial court */
  constructor(cellSize = 160) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.stamp = 1;
  }

  /** Clears indexed bodies while keeping allocated buckets for reuse. */
  clear() {
    for (const bucket of this.cells.values()) bucket.length = 0;
  }

  /** @param {object} body rectangle to index */
  add(body) {
    const minX = Math.floor(body.x / this.cellSize);
    const maxX = Math.floor((body.x + body.w) / this.cellSize);
    const minY = Math.floor(body.y / this.cellSize);
    const maxY = Math.floor((body.y + body.h) / this.cellSize);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) this.bucket(x, y).push(body);
    }
  }

  /** @param {number} x cell x @param {number} y cell y @returns {Array<object>} */
  bucket(x, y) {
    const key = `${x}:${y}`;
    let bucket = this.cells.get(key);
    if (!bucket) { bucket = []; this.cells.set(key, bucket); }
    return bucket;
  }

  /** @param {Array<object>} bodies rectangles */
  build(bodies) {
    this.clear();
    for (const body of bodies) this.add(body);
    return this;
  }

  /**
   * Queries nearby bodies into a caller-owned output array.
   * @param {object} area rectangle query.
   * @param {Array<object>} out reusable output list.
   * @returns {Array<object>} same output list.
   */
  queryInto(area, out = []) {
    out.length = 0;
    this.stamp = this.stamp >= 2147483640 ? 1 : this.stamp + 1;
    const stamp = this.stamp;
    const minX = Math.floor(area.x / this.cellSize);
    const maxX = Math.floor((area.x + area.w) / this.cellSize);
    const minY = Math.floor(area.y / this.cellSize);
    const maxY = Math.floor((area.y + area.h) / this.cellSize);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const bucket = this.cells.get(`${x}:${y}`);
        if (!bucket) continue;
        for (const body of bucket) {
          if (body.__spatialStamp === stamp) continue;
          body.__spatialStamp = stamp;
          out.push(body);
        }
      }
    }
    return out;
  }

  /** Legacy convenience API for tests and tools. */
  query(area) { return this.queryInto(area, []); }
}
