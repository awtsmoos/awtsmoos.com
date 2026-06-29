// B"H

const { dequant } = require('../math/dequant.js');
const { elements } = require('./tensor-shape.js');
const { TensorByteCache } = require('./tensor-byte-cache.js');

/**
 * Tensor access layer for the transformer runner.
 *
 * The old Awtsmoos GGUF worker cached loaded weights so one chat would not
 * reread the same mountain thousands of times.  This streamer keeps that
 * covenant while still allowing row-range reads for token embeddings.  Whole
 * projection tensors enter a bounded cache; small norm tensors become float
 * arrays once; the river of bytes no longer circles the same stone forever.
 */
class TensorStreamer {
  constructor(file, stats, options = {}) {
    this.file = file;
    this.stats = stats;
    this.byteCache = new TensorByteCache(options.cacheBytes || 0);
    this.floatCache = new Map();
  }

  raw(tensor) {
    const key = tensor && tensor.name;
    const cached = this.byteCache.get(key);
    if (cached) return cached;
    const bytes = this.file.tensorBytes(tensor);
    this.noteRead(bytes.length, key);
    return this.byteCache.set(key, bytes);
  }

  range(tensor, offset, length) {
    const whole = this.byteCache.get(tensor && tensor.name);
    if (whole) return whole.subarray(offset, offset + length);
    const bytes = this.file.tensorRangeBytes(tensor, offset, length);
    this.noteRead(bytes.length, tensor && tensor.name);
    return bytes;
  }

  float(tensor) {
    const key = tensor && tensor.name;
    if (this.floatCache.has(key)) return this.floatCache.get(key);
    const bytes = this.raw(tensor);
    const values = dequant(bytes, tensor.type, elements(tensor));
    this.noteDequant(bytes.length, key);
    this.floatCache.set(key, values);
    return values;
  }

  summary() {
    return { byteCache: this.byteCache.summary(), floatCacheEntries: this.floatCache.size };
  }

  noteRead(length, name) {
    if (this.stats) this.stats.read(length, name);
  }

  noteDequant(length, name) {
    if (this.stats) this.stats.dequant(length, name);
  }

  dispose() {
    this.floatCache.clear();
  }
}

module.exports = { TensorStreamer };
