// B"H — loads merkava-pixel.wasm (or embedded bytes) and wraps exports.
// B"H — JS pixel fallback when merkava-pixel.wasm cannot be fetched.
// The .wasm is a gitignored build artifact: no .wat source ships in the repo
// and the file 404s on the live site, so engine creation would throw for
// every tab. This implements the same interface the WASM wrapper exposes
// (memory + clear/fillRect/gradRect + stats) over a plain ArrayBuffer, so
// WasmFramebuffer and GuestFramebuffer work unchanged, slower. Writes are
// direct overwrites, matching the raw-memory WASM fills. Gradient is the
// simple two-stop vertical (CSS default 180deg) case the callers request.
const JS_PIXEL_MAX = 1920 * 1200 * 4;
export function createJsPixelFallback() {
  const buffer = new ArrayBuffer(JS_PIXEL_MAX);
  const data = new Uint8ClampedArray(buffer);
  const stats = { clear: 0, fill: 0, grad: 0, gradJsFallback: 0 };
  return {
    memory: { buffer },
    stats,
    clear(p, s, w, h, r, g, b, a) {
      stats.clear++;
      const stride = (s | 0) || w * 4;
      for (let yy = 0; yy < h; yy++) {
        const base = p + yy * stride;
        for (let xx = 0; xx < w * 4; xx += 4) {
          data[base + xx] = r; data[base + xx + 1] = g;
          data[base + xx + 2] = b; data[base + xx + 3] = a;
        }
      }
    },
    fillRect(p, s, fbw, fbh, x, y, w, h, r, g, b, a) {
      stats.fill++;
      const stride = (s | 0) || fbw * 4;
      const x0 = Math.max(0, x | 0), y0 = Math.max(0, y | 0);
      const x1 = Math.min(fbw, Math.ceil(x + w)), y1 = Math.min(fbh, Math.ceil(y + h));
      for (let yy = y0; yy < y1; yy++) {
        const base = p + yy * stride;
        for (let xx = x0; xx < x1; xx++) {
          const i = base + xx * 4;
          data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
        }
      }
    },
    gradRect(p, s, fbw, fbh, x, y, w, h, r0, g0, b0, r1, g1, b1) {
      stats.grad++;
      const stride = (s | 0) || fbw * 4;
      const x0 = Math.max(0, x | 0), y0 = Math.max(0, y | 0);
      const x1 = Math.min(fbw, Math.ceil(x + w)), y1 = Math.min(fbh, Math.ceil(y + h));
      const denom = Math.max(1, Math.ceil(y + h) - Math.floor(y) - 1);
      for (let yy = y0; yy < y1; yy++) {
        const t = Math.max(0, Math.min(1, (yy - Math.floor(y)) / denom));
        const r = Math.round(r0 + (r1 - r0) * t);
        const g = Math.round(g0 + (g1 - g0) * t);
        const b = Math.round(b0 + (b1 - b0) * t);
        const base = p + yy * stride;
        for (let xx = x0; xx < x1; xx++) {
          const i = base + xx * 4;
          data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
        }
      }
    },
  };
}

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
