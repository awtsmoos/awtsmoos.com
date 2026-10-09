// B"H — Gap 0: cascade.js reads process.env.MERKAVA_CASCADE_SLOW; browsers have no process.
globalThis.process ??= { env: {} };
// B"H — Merkava engine entry for the browser build.
// Full pipeline: HTML -> DOM -> cascade -> layout -> paint -> pixels.
// Pixel buffer lives in WASM memory; hot clear/fill/gradient loops run in WASM.
// Requires vm-core.js (classic script) to have run first for page scripts.
import { parseHtmlToDom } from "./merkava-service/snapshots/software/htmlParser.js";
import { createInteractivePage } from "./guest-dom.js";
import { buildLayoutTree } from "./merkava-service/snapshots/software/domLayout.js";
import { paintLayout } from "./merkava-service/snapshots/software/domPainter.js";
import { Framebuffer } from "./merkava-service/snapshots/software/framebuffer.js";
import { ScaledFramebuffer } from "./merkava-service/snapshots/software/supersample.js";
import { parseColor } from "./merkava-service/snapshots/software/color.js";
import { initPixelWasm } from "./pixel-wasm.js";

export const MERKAVA_BACKEND = "merkava-wasm/1.0";
export const MERKAVA_MAX_VIEWPORT = { width: 1920, height: 1200 };

const GRAD_RE = /linear-gradient\((.*)\)/i;
const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|\b[a-z]+\b/gi;

function extractCssText(html) {
  return [...String(html || "").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1]).join("\n");
}

class WasmFramebuffer extends Framebuffer {
  constructor(w, h, bg, px) {
    super(w, h, [0, 0, 0, 0]);
    this.px = px;
    const need = w * h * 4;
    if (px.memory.buffer.byteLength < need) throw new Error("viewport exceeds WASM memory");
    this.data = new Uint8ClampedArray(px.memory.buffer, 0, need);
    this.clear(bg);
  }
  clear(c) {
    // Base-class constructor calls clear() before this.px exists; do one JS clear then.
    if (!this.px) { Framebuffer.prototype.clear.call(this, c); return; }
    const a = c[3] ?? 255;
    this.px.clear(0, this.width * 4, this.width, this.height, c[0] | 0, c[1] | 0, c[2] | 0, a | 0);
  }
  fillRect(x, y, w, h, c) {
    if (!(w > 0 && h > 0)) return;
    const a = c[3] ?? 255;
    this.px.fillRect(0, this.width * 4, this.width, this.height,
      Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h),
      c[0] | 0, c[1] | 0, c[2] | 0, a | 0);
  }
  gradientRect(x, y, w, h, background, fallback) {
    const m = String(background || "").match(GRAD_RE);
    if (m) {
      const cols = [...m[1].matchAll(COLOR_RE)]
        .map((mm) => parseColor(mm[0], null))
        .filter((c) => c && c[3] === 255);
      if (cols.length === 2 && w > 0 && h > 0) {
        this.px.gradRect(0, this.width * 4, this.width, this.height,
          Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h), cols[0], cols[1]);
        return;
      }
    }
    this.px.stats.gradJsFallback++;
    super.gradientRect(x, y, w, h, background, fallback);
  }
}

export async function createMerkavaEngine(wasmSource) {
  const px = await initPixelWasm(wasmSource);
  function renderPage(html, opts = {}) {
    const t0 = performance.now();
    const width = Math.max(1, Math.min(MERKAVA_MAX_VIEWPORT.width, opts.width || 960));
    const height = Math.max(1, Math.min(MERKAVA_MAX_VIEWPORT.height, opts.height || 640));
    const cssText = extractCssText(html) + "\n" + (opts.css || "");
    const dom = parseHtmlToDom(html);
    const layout = buildLayoutTree(dom, { width, height }, { cssText });
    const fb = new WasmFramebuffer(width, height, [255, 255, 255, 255], px);
    const surface = new ScaledFramebuffer(fb, 1, width, height);
    paintLayout(surface, layout, {});
    return {
      data: fb.data, width, height,
      ms: performance.now() - t0,
      layoutItems: layout.length,
      backend: MERKAVA_BACKEND,
    };
  }
  // Interactive pages: <script> runs in the Merkava VM (never V8); DOM
  // mutations re-cascade/re-layout/re-paint; canvas 2d/WebGL composite in.
  function createPage(html, opts = {}) {
    return createInteractivePage(html, { ...opts, px });
  }
  return { renderPage, createPage, stats: px.stats, backend: MERKAVA_BACKEND };
}
