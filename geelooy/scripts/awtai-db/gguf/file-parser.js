// B"H
const fs = require('fs');
const utf8 = require('../core/utf8.js');
const T = require('./value-types.js');
const { align } = require('../core/align.js');
const { DEFAULT_ALIGNMENT } = require('../format/constants.js');
const { tensorByteLength } = require('./parser.js');
const { roleOf, layerOf } = require('./tensor-naming.js');

/**
 * Disk-first GGUF header parser.  The tensor bodies stay asleep on disk; only
 * metadata and tensor descriptors enter RAM so conversion can trade memory for
 * sequential temporary disk writes.
 */
function parseGgufFile(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const c = { fd, offset: 0 };
  try {
    const magic = utf8.decode(read(c, 4));
    if (magic !== 'GGUF') throw new Error("B'H expected GGUF magic, got " + magic);
    const version = u32(c), tensorCount = Number(u64(c)), metadataCount = Number(u64(c));
    const metadata = {};
    let alignment = DEFAULT_ALIGNMENT;
    for (let i = 0; i < metadataCount; i++) {
      const key = str(c), type = u32(c), value = val(c, type);
      metadata[key] = value;
      if (key === 'general.alignment') alignment = Number(value) || DEFAULT_ALIGNMENT;
    }
    const tensors = [];
    for (let i = 0; i < tensorCount; i++) {
      const name = str(c), dc = u32(c), dims = [];
      for (let d = 0; d < dc; d++) dims.push(Number(u64(c)));
      const type = u32(c), ggufOffset = Number(u64(c));
      const t = { id: i, name, dims, type, ggufOffset, layer: layerOf(name), role: roleOf(name) };
      t.byteLength = tensorByteLength(t);
      tensors.push(t);
    }
    return { version, tensorCount, metadataCount, alignment, tensorDataBase: align(c.offset, alignment), metadata, tensors, filePath };
  } finally { fs.closeSync(fd); }
}

function val(c, type) {
  switch (type) {
    case T.UINT8: return read(c, 1)[0];
    case T.INT8: return read(c, 1).readInt8(0);
    case T.UINT16: return read(c, 2).readUInt16LE(0);
    case T.INT16: return read(c, 2).readInt16LE(0);
    case T.UINT32: return u32(c);
    case T.INT32: return read(c, 4).readInt32LE(0);
    case T.FLOAT32: return read(c, 4).readFloatLE(0);
    case T.BOOL: return !!read(c, 1)[0];
    case T.STRING: return str(c);
    case T.ARRAY: { const inner = u32(c), n = Number(u64(c)), a = []; for (let i = 0; i < n; i++) a.push(val(c, inner)); return a; }
    case T.UINT64: return u64(c).toString();
    case T.INT64: return read(c, 8).readBigInt64LE(0).toString();
    case T.FLOAT64: return read(c, 8).readDoubleLE(0);
    default: throw new Error("B'H unknown GGUF value type " + type);
  }
}

function str(c) { const n = Number(u64(c)); return utf8.decode(read(c, n)); }
function u32(c) { return read(c, 4).readUInt32LE(0); }
function u64(c) { return read(c, 8).readBigUInt64LE(0); }
function read(c, n) { const b = Buffer.allocUnsafe(n); fs.readSync(c.fd, b, 0, n, c.offset); c.offset += n; return b; }

module.exports = { parseGgufFile };
