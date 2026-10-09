// B"H — loads merkava-pixel.wasm (or embedded bytes) and wraps exports.
export async function initPixelWasm(source) {
  let bytes;
  if (typeof source === "string") {
    const res = await fetch(source);
    if (!res.ok) throw new Error("WASM fetch failed: " + res.status);
    bytes = await res.arrayBuffer();
  } else if (source instanceof Uint8Array) {
    bytes = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  } else {
    bytes = source;
  }
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const { mem, clear, fill_rect, grad_rect } = instance.exports;
  const stats = { clear: 0, fill: 0, grad: 0, gradJsFallback: 0 };
  return {
    memory: mem, stats,
    clear: (p, s, w, h, r, g, b, a) => { stats.clear++; return clear(p, s, w, h, r, g, b, a); },
    fillRect: (p, s, fbw, fbh, x, y, w, h, r, g, b, a) => { stats.fill++; return fill_rect(p, s, fbw, fbh, x, y, w, h, r, g, b, a); },
    gradRect: (p, s, fbw, fbh, x, y, w, h, c0, c1) => { stats.grad++; return grad_rect(p, s, fbw, fbh, x, y, w, h, c0[0], c0[1], c0[2], c1[0], c1[1], c1[2]); },
  };
}
