// B"H
const { parseGguf } = require('../gguf/parser.js');
const { makeManifest } = require('./manifest.js');
const { writeAwtaiBytes } = require('./writer.js');
const { convertGgufFile } = require('./file-converter.js');

function convertGgufBytes(input, options = {}) {
  const parsed = parseGguf(input);
  const manifest = makeManifest(parsed, options);
  const tensorBytes = new Uint8Array(manifest.storagePlan.tensorBytes);
  for (const t of manifest.tensors) {
    const start = parsed.tensorDataBase + t.ggufOffset;
    tensorBytes.set(parsed.bytes.subarray(start, start + t.byteLength), t.awtaiOffset);
  }
  const bytes = writeAwtaiBytes(manifest, tensorBytes);
  return { bytes, manifest, parsed };
}

module.exports = { convertGgufBytes, convertGgufFile };
