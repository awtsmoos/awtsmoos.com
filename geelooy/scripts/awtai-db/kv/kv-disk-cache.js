// B"H
const fs = require('fs');
const path = require('path');

/**
 * Disk vessel for old KV pages.
 *
 * The page leaves RAM, but not memory.  It descends into a small binary cave
 * and returns when attention asks for the whole story in order.
 */
class KvDiskCache {
  constructor(dir) {
    this.dir = dir;
    this.count = 0;
    this.bytes = 0;
    this.pages = new Map();
    fs.mkdirSync(dir, { recursive: true });
  }

  write(layer, pos, k, v) {
    const file = this.file(layer, pos);
    const body = pack(k, v);
    fs.writeFileSync(file, body);
    this.remember(layer, pos, file, body.length);
    return file;
  }

  read(layer, pos) {
    const file = this.file(layer, pos);
    const buffer = fs.readFileSync(file);
    return unpack(buffer);
  }

  list(layer) {
    const pages = this.pages.get(layer) || [];
    return pages.map(page => ({ pos: page.pos, ...this.read(layer, page.pos) }));
  }

  file(layer, pos) {
    return path.join(this.dir, `L${layer}-P${pos}.bin`);
  }

  remember(layer, pos, file, bytes) {
    if (!this.pages.has(layer)) this.pages.set(layer, []);
    this.pages.get(layer).push({ pos, file, bytes });
    this.pages.get(layer).sort((a, b) => a.pos - b.pos);
    this.count++;
    this.bytes += bytes;
  }

  summary() {
    return { dir: this.dir, count: this.count, bytes: this.bytes };
  }
}

function pack(k, v) {
  const kb = Buffer.from(k.buffer, k.byteOffset, k.byteLength);
  const vb = Buffer.from(v.buffer, v.byteOffset, v.byteLength);
  const head = Buffer.alloc(8);
  head.writeUInt32LE(k.length, 0);
  head.writeUInt32LE(v.length, 4);
  return Buffer.concat([head, kb, vb]);
}

function unpack(buffer) {
  const kl = buffer.readUInt32LE(0);
  const vl = buffer.readUInt32LE(4);
  const k = new Float32Array(buffer.buffer, buffer.byteOffset + 8, kl).slice();
  const v = new Float32Array(buffer.buffer, buffer.byteOffset + 8 + kl * 4, vl).slice();
  return { k, v };
}

module.exports = { KvDiskCache };
