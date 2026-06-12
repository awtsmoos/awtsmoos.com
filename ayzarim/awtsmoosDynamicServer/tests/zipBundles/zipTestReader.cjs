// B"H
const zlib = require("zlib");

/**
 * B"H
 * A tiny ZIP reader for tests. It understands the deflated ZIP files emitted by
 * zipWriter.js and verifies that isolated installers can unpack every entry.
 */
function readZip(buffer) {
  const out = new Map();
  let offset = 0;
  while (offset + 4 < buffer.length && buffer.readUInt32LE(offset) === 0x04034b50) {
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const name = buffer.slice(offset + 30, offset + 30 + nameLen).toString("utf8");
    const dataStart = offset + 30 + nameLen + extraLen;
    const dataEnd = dataStart + compressedSize;
    const raw = buffer.slice(dataStart, dataEnd);
    out.set(name, method === 8 ? zlib.inflateRawSync(raw) : raw);
    offset = dataEnd;
  }
  return out;
}

module.exports = { readZip };
