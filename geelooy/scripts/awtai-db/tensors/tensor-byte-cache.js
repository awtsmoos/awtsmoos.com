// B"H

/**
 * A tiny byte-cache for AWTAI tensor bodies.
 *
 * The first pass through a model is the wandering of Avraham through a land
 * not yet mapped.  The second pass must not ask every mountain to introduce
 * itself again.  This cache remembers whole packed tensors by name, so the
 * transformer can breathe through math instead of drowning in repeated disk
 * reads.  It is a bounded vessel: when the palace grows too large, the oldest
 * rooms return to silence and the newest rooms remain lit.
 */
class TensorByteCache {
  constructor(limitBytes = 0) {
    this.limitBytes = Math.max(0, Number(limitBytes) || 0);
    this.bytes = 0;
    this.map = new Map();
  }

  get(key) {
    if (!this.limitBytes || !this.map.has(key)) return null;
    const hit = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, hit);
    return hit.bytes;
  }

  set(key, bytes) {
    if (!this.limitBytes || !bytes || bytes.length > this.limitBytes) return bytes;
    if (this.map.has(key)) this.drop(key);
    this.map.set(key, { bytes, size: bytes.length });
    this.bytes += bytes.length;
    this.evict();
    return bytes;
  }

  drop(key) {
    const old = this.map.get(key);
    if (!old) return;
    this.map.delete(key);
    this.bytes -= old.size;
  }

  evict() {
    while (this.bytes > this.limitBytes && this.map.size) {
      const oldest = this.map.keys().next().value;
      this.drop(oldest);
    }
  }

  summary() {
    return { limitBytes: this.limitBytes, bytes: this.bytes, entries: this.map.size };
  }
}

module.exports = { TensorByteCache };
