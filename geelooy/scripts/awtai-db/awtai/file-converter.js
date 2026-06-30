// B"H
const fs = require('fs');
const path = require('path');
const utf8 = require('../core/utf8.js');
const { MAGIC, HEADER_SIZE } = require('../format/constants.js');
const { parseGgufFile } = require('../gguf/file-parser.js');
const { makeManifest } = require('./manifest.js');

/**
 * Disk-streaming GGUF -> AWTAI converter.  The full model body never becomes a
 * JavaScript array; tensor bytes are copied from source fd to destination fd in
 * windows, trading RAM for disk and patience.
 */
function convertGgufFile(inputPath, outputPath, options = {}) {
  const parsed = parseGgufFile(inputPath);
  const manifest = makeManifest(parsed, { ...options, name: options.name || path.basename(inputPath) });
  const manifestBytes = finalManifestBytes(manifest);
  const tmp = outputPath + `.tmp-${process.pid}`;
  const windowBytes = saneWindow(options.windowBytes);
  let copied = 0;
  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const outFd = fs.openSync(tmp, 'w');
    try {
      fs.writeSync(outFd, header(manifestBytes.length), 0, HEADER_SIZE, 0);
      fs.writeSync(outFd, manifestBytes, 0, manifestBytes.length, HEADER_SIZE);
      copied = copyTensors(inputPath, outFd, parsed, manifest, HEADER_SIZE + manifestBytes.length, windowBytes);
    } finally { fs.closeSync(outFd); }
    fs.renameSync(tmp, outputPath);
  } catch (error) {
    try { fs.unlinkSync(tmp); } catch (_) {}
    throw error;
  }
  return { output: outputPath, manifest, tensors: manifest.tensors.length, packets: manifest.packets.length, bytes: HEADER_SIZE + manifestBytes.length + copied, tensorBytes: copied, windowBytes };
}

function copyTensors(inputPath, outFd, parsed, manifest, dataOffset, windowBytes) {
  const inFd = fs.openSync(inputPath, 'r');
  const buf = Buffer.allocUnsafe(windowBytes);
  let copied = 0;
  try {
    for (const t of manifest.tensors) {
      let left = t.byteLength;
      let src = parsed.tensorDataBase + t.ggufOffset;
      let dst = dataOffset + t.awtaiOffset;
      while (left > 0) {
        const n = Math.min(left, windowBytes);
        const got = fs.readSync(inFd, buf, 0, n, src);
        if (got !== n) throw new Error(`B'H short GGUF read for ${t.name}`);
        fs.writeSync(outFd, buf, 0, got, dst);
        src += got; dst += got; left -= got; copied += got;
      }
    }
  } finally { fs.closeSync(inFd); }
  return copied;
}

function finalManifestBytes(manifest) {
  let bytes = Buffer.from(JSON.stringify(manifest));
  for (let i = 0; i < 8; i++) {
    manifest.dataRegion.offset = HEADER_SIZE + bytes.length;
    const next = Buffer.from(JSON.stringify(manifest));
    if (next.length === bytes.length) return next;
    bytes = next;
  }
  return bytes;
}

function header(len) {
  const out = Buffer.alloc(HEADER_SIZE);
  out.set(utf8.encode(MAGIC).subarray(0, 8), 0);
  new DataView(out.buffer, out.byteOffset, out.byteLength).setBigUint64(8, BigInt(len), true);
  return out;
}

function saneWindow(value) {
  const n = Number(value || process.env.AWTAI_CONVERT_WINDOW_BYTES || 8 * 1024 * 1024);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 8 * 1024 * 1024;
}

module.exports = { convertGgufFile };
