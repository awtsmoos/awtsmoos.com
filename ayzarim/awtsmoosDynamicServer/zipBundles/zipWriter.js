// B"H
const zlib = require("zlib");
const { crc32 } = require("./crc32.js");

/**
 * B"H
 * Chapter 400: The installer scroll was folded into a lawful ZIP chamber.
 * This writer emits ordinary deflated ZIP files with local headers and central
 * directory records, using only Node core modules.
 */
function makeZip(entries = []) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const name = safeZipName(entry.name);
    const source = Buffer.from(entry.content || []);
    const compressed = zlib.deflateRawSync(source, { level: 9 });
    const local = localHeader(name, source, compressed);
    const central = centralHeader(name, source, compressed, offset);
    locals.push(local, compressed);
    centrals.push(central);
    offset += local.length + compressed.length;
  }
  const centralStart = offset;
  const centralBuffer = Buffer.concat(centrals);
  const end = endRecord(entries.length, centralBuffer.length, centralStart);
  return Buffer.concat([...locals, centralBuffer, end]);
}

function localHeader(name, source, compressed) {
  const fileName = Buffer.from(name, "utf8");
  const h = Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50, 0);
  h.writeUInt16LE(20, 4);
  h.writeUInt16LE(0x0800, 6);
  h.writeUInt16LE(8, 8);
  h.writeUInt16LE(0, 10);
  h.writeUInt16LE(0, 12);
  h.writeUInt32LE(crc32(source), 14);
  h.writeUInt32LE(compressed.length, 18);
  h.writeUInt32LE(source.length, 22);
  h.writeUInt16LE(fileName.length, 26);
  h.writeUInt16LE(0, 28);
  return Buffer.concat([h, fileName]);
}

function centralHeader(name, source, compressed, offset) {
  const fileName = Buffer.from(name, "utf8");
  const h = Buffer.alloc(46);
  h.writeUInt32LE(0x02014b50, 0);
  h.writeUInt16LE(20, 4);
  h.writeUInt16LE(20, 6);
  h.writeUInt16LE(0x0800, 8);
  h.writeUInt16LE(8, 10);
  h.writeUInt16LE(0, 12);
  h.writeUInt16LE(0, 14);
  h.writeUInt32LE(crc32(source), 16);
  h.writeUInt32LE(compressed.length, 20);
  h.writeUInt32LE(source.length, 24);
  h.writeUInt16LE(fileName.length, 28);
  h.writeUInt16LE(0, 30);
  h.writeUInt16LE(0, 32);
  h.writeUInt16LE(0, 34);
  h.writeUInt16LE(0, 36);
  h.writeUInt32LE(0, 38);
  h.writeUInt32LE(offset, 42);
  return Buffer.concat([h, fileName]);
}

function endRecord(count, centralSize, centralStart) {
  const h = Buffer.alloc(22);
  h.writeUInt32LE(0x06054b50, 0);
  h.writeUInt16LE(0, 4);
  h.writeUInt16LE(0, 6);
  h.writeUInt16LE(count, 8);
  h.writeUInt16LE(count, 10);
  h.writeUInt32LE(centralSize, 12);
  h.writeUInt32LE(centralStart, 16);
  h.writeUInt16LE(0, 20);
  return h;
}

function safeZipName(name) {
  const clean = String(name || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\0")) throw new Error("Unsafe ZIP entry: " + name);
  return clean;
}

module.exports = { makeZip, safeZipName };
