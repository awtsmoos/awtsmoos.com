// B"H

/**
 * RAM+disk KV cache.
 *
 * The old token is not banished when RAM is small. It is written beneath the
 * floorboards, then summoned back so attention sees the whole procession in
 * position order.  Low memory remains low; correctness keeps its crown.
 */
class KvCache {
  constructor(maxRamTokens = 1, disk = null) {
    this.maxRamTokens = maxRamTokens;
    this.disk = disk;
    this.layers = new Map();
    this.spilled = 0;
  }

  layer(id) {
    if (!this.layers.has(id)) this.layers.set(id, []);
    return this.layers.get(id);
  }

  append(layer, pos, k, v) {
    const pages = this.layer(layer);
    pages.push({ pos, k, v });
    pages.sort((a, b) => a.pos - b.pos);
    while (pages.length > this.maxRamTokens) this.spillOldest(layer, pages);
  }

  spillOldest(layer, pages) {
    const old = pages.shift();
    if (!old || !this.disk) return;
    this.disk.write(layer, old.pos, old.k, old.v);
    this.spilled++;
  }

  get(layer) {
    const ram = this.layer(layer);
    const disk = this.disk ? this.disk.list(layer) : [];
    return disk.concat(ram).sort((a, b) => a.pos - b.pos);
  }

  summary() {
    let pages = 0;
    for (const layer of this.layers.values()) pages += layer.length;
    return { layers: this.layers.size, pages, maxRamTokens: this.maxRamTokens, spilled: this.spilled };
  }
}

module.exports = { KvCache };
