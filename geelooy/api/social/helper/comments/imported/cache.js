// B"H
/** A bounded, expiring vessel: fast enough to serve, small enough to remain honest. */
class LruCache {
  constructor(limit = 128, maxAgeMs = 300000) { this.limit = limit; this.maxAgeMs = maxAgeMs; this.map = new Map(); }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.at > this.maxAgeMs) { this.map.delete(key); return undefined; }
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }
  set(key, value) {
    this.map.delete(key);
    this.map.set(key, { value, at: Date.now() });
    while (this.map.size > this.limit) this.map.delete(this.map.keys().next().value);
    return value;
  }
  clear() { this.map.clear(); }
}
module.exports = { LruCache };
