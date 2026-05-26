// B"H
/** Byte-slice pool for MODE2 arenas: ids point into UTF-8 bytes. */
function buildPoolBytes(strings = []) {
  const enc = new TextEncoder();
  const encoded = strings.map(s => enc.encode(String(s ?? '')));
  const offsets = new Uint32Array(encoded.length + 1);
  let total = 0;
  for (let i = 0; i < encoded.length; i++) { offsets[i] = total; total += encoded[i].length; }
  offsets[encoded.length] = total;
  const bytes = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of encoded) { bytes.set(chunk, cursor); cursor += chunk.length; }
  return { bytes, offsets, count: encoded.length };
}
function poolBytesSize(poolBytes) { return (poolBytes?.bytes?.byteLength || 0) + (poolBytes?.offsets?.byteLength || 0); }
function decodePoolRef(poolBytes, id) {
  const start = poolBytes.offsets[id] || 0;
  const end = poolBytes.offsets[id + 1] ?? start;
  return new TextDecoder().decode(poolBytes.bytes.subarray(start, end));
}
function makeLazyPool(poolBytes) {
  const cache = new Map();
  return {
    bytes: poolBytes.bytes,
    offsets: poolBytes.offsets,
    count: poolBytes.count,
    get(id) { if (!cache.has(id)) cache.set(id, decodePoolRef(poolBytes, id)); return cache.get(id); },
    cachedCount() { return cache.size; }
  };
}
module.exports = { buildPoolBytes, poolBytesSize, decodePoolRef, makeLazyPool };
