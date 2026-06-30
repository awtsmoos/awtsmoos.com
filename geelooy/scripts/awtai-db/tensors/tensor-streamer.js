// B"H

const { dequant } = require('../math/dequant.js');
const { elements } = require('./tensor-shape.js');
const { TensorByteCache } = require('./tensor-byte-cache.js');
const { nativeOpenModelMap, nativeCloseModelMap } = require('../native/native-matvec.js');

class TensorStreamer {
  constructor(file, stats, options = {}) {
    this.file = file;
    this.stats = stats;
    this.byteCache = new TensorByteCache(options.cacheBytes || 0);
    this.floatCache = new Map();
    this.scope = null;
    this.nativeMap = openNativeMap(file);
  }

  beginScope() {
    if (!this.scope) this.scope = new Map();
  }

  endScope() {
    if (this.scope) this.scope.clear();
    this.scope = null;
  }

  raw(tensor) {
    const key = tensor && tensor.name;
    const scoped = this.scope && this.scope.get(key);
    if (scoped) return scoped;
    const cached = this.byteCache.get(key);
    if (cached) return cached;
    const bytes = this.file.tensorBytes(tensor);
    this.noteRead(bytes.length, key);
    if (this.scope) this.scope.set(key, bytes);
    return this.scope ? bytes : this.byteCache.set(key, bytes);
  }

  range(tensor, offset, length) {
    const key = tensor && tensor.name;
    const scoped = this.scope && this.scope.get(key);
    if (scoped) return scoped.subarray(offset, offset + length);
    const whole = this.byteCache.get(key);
    if (whole) return whole.subarray(offset, offset + length);
    const bytes = this.file.tensorRangeBytes(tensor, offset, length);
    this.noteRead(bytes.length, key);
    return bytes;
  }

  offset(tensor) {
    return this.file.tensorOffset(tensor);
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
    return {
      byteCache: this.byteCache.summary(),
      floatCacheEntries: this.floatCache.size,
      scopedEntries: this.scope ? this.scope.size : 0,
      nativeMap: !!this.nativeMap
    };
  }

  noteRead(length, name) {
    if (this.stats) this.stats.read(length, name);
  }

  noteDequant(length, name) {
    if (this.stats) this.stats.dequant(length, name);
  }

  dispose() {
    this.endScope();
    this.floatCache.clear();
    if (this.nativeMap) nativeCloseModelMap(this.nativeMap);
    this.nativeMap = null;
  }
}

function openNativeMap(file) {
  if (/^(0|false|no)$/.test(String(process.env.AWTAI_NATIVE_MODEL_MAP || '1'))) return null;
  const path = file && file.file && file.file.path;
  if (!path) return null;
  try { return nativeOpenModelMap(path); }
  catch (_) { return null; }
}

module.exports = { TensorStreamer };
