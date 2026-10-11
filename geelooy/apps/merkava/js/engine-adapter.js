// B"H — Engine adapter: the ONLY module that touches the Merkava engine API directly.
// Everything else in the app talks to these functions. When the engine API changes
// (engine worker re-sync), re-point the calls below and the rest of the app is untouched.
//
// Engine contract (engine/merkava-engine.js):
//   createMerkavaEngine(wasmPath) -> Promise<{ renderPage, createPage, stats, backend }>
//   renderPage(html, {width,height,css,js,wasm}) -> { data, width, height, ms, layoutItems, backend }
//   createPage(html, {width,height,css,wasm}) -> Promise<InteractivePage>
// InteractivePage (engine/guest-dom.js): page scripts run in the Merkava VM;
//   page.lastRender -> { data, width, height, ms, layoutItems, backend }
//   page.render() -> fresh render; page.advanceTime(ms) pumps the virtual clock;
//   page.click(selector) / page.dispatchEvent(type, selector) dispatch to guest listeners.
//   The retained layout tree lives at page.__adapter.tree: items are
//   { node, x, y, width, height, children, kind, style } — used for hit-testing.
import { createMerkavaEngine, MERKAVA_MAX_VIEWPORT } from "../engine/merkava-engine.js";

export const ENGINE_WASM_PATH = "./engine/merkava-pixel.wasm";
export const ENGINE_MAX_VIEWPORT = MERKAVA_MAX_VIEWPORT || { width: 1920, height: 1200 };
export const ENGINE_BACKEND = "merkava-wasm/1.0";

/** Create one engine instance (one per tab; WASM framebuffer is per-instance). */
export async function createEngine(wasmPath = ENGINE_WASM_PATH) {
  if (typeof WebAssembly === "undefined") {
    throw new Error("WebAssembly is not available in this host.");
  }
  const engine = await createMerkavaEngine(wasmPath);
  return engine;
}

function clampViewport(opts = {}) {
  const width = Math.max(1, Math.min(ENGINE_MAX_VIEWPORT.width, Math.floor(opts.width || 960)));
  const height = Math.max(1, Math.min(ENGINE_MAX_VIEWPORT.height, Math.floor(opts.height || 640)));
  return { width, height };
}

/** Blit an engine render ({data,width,height}) onto a 2D canvas. */
export function blitRender(canvas, render) {
  canvas.width = render.width;
  canvas.height = render.height;
  const ctx = canvas.getContext("2d");
  const bytes = render.data.byteOffset === 0 && render.data.buffer.byteLength === render.width * render.height * 4
    ? render.data
    : new Uint8ClampedArray(render.data.buffer, render.data.byteOffset, render.width * render.height * 4);
  ctx.putImageData(new ImageData(bytes, render.width, render.height), 0, 0);
}

/**
 * Static render: HTML+CSS -> pixels, no page-JS execution.
 * Used when the JS setting is off, or when the engine has no createPage.
 * Returns { width, height, ms, layoutItems, backend }.
 * opts: { width, height, css, wasmAccel }.
 */
export function renderToCanvas(engine, canvas, html, opts = {}) {
  const { width, height } = clampViewport(opts);
  const page = engine.renderPage(String(html || ""), {
    width,
    height,
    css: opts.css || "",
    js: false,
    wasm: opts.wasmAccel !== false,
  });
  blitRender(canvas, page);
  return { width: page.width, height: page.height, ms: page.ms, layoutItems: page.layoutItems, backend: page.backend };
}

/**
 * Interactive page: <script> runs in the Merkava VM (never host V8); DOM
 * mutations re-cascade/re-layout/re-paint via the LayoutScheduler.
 * Call only when the JS setting is on and engine.createPage exists.
 * opts: { width, height, css, wasmAccel }.
 * Returns the engine's InteractivePage (page.lastRender holds the pixels).
 */
export async function createInteractivePage(engine, html, opts = {}) {
  if (!engine || typeof engine.createPage !== "function") {
    throw new Error("Interactive pages need engine.createPage (re-sync engine/).");
  }
  const { width, height } = clampViewport(opts);
  const page = await engine.createPage(String(html || ""), {
    width,
    height,
    css: opts.css || "",
    wasm: opts.wasmAccel !== false,
  });
  return page;
}

/* ---------- host-canvas hit-testing -> guest listeners ---------- */

/** Layout items nest via .children; later siblings paint on top. */
function layoutTreeOf(page) {
  const tree = page && page.__adapter && page.__adapter.tree;
  if (Array.isArray(tree) && tree.length) return tree;
  // Retained tree missing (shouldn't happen — createPage renders once);
  // force a render so the tree exists.
  page.render();
  const t2 = page.__adapter && page.__adapter.tree;
  return Array.isArray(t2) ? t2 : [];
}

function elementOf(item) {
  let n = item && item.node;
  if (!n) return null;
  if (n.nodeType === 3) n = n.parentNode; // text fragment -> its element
  return n && n.nodeType !== 3 ? n : null;
}

/**
 * Deepest topmost layout element containing (x, y) in engine pixels.
 * Returns { node, chain } where chain is the element ancestor chain
 * (outermost first), or null when nothing was hit.
 */
export function hitTest(page, x, y) {
  const tree = layoutTreeOf(page);
  function walk(items, chain) {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (!(x >= it.x && y >= it.y && x < it.x + it.width && y < it.y + it.height)) continue;
      const el = elementOf(it);
      const nchain = el ? chain.concat([el]) : chain;
      if (it.children && it.children.length) {
        const deep = walk(it.children, nchain);
        if (deep) return deep;
      }
      if (el) return { node: el, chain: nchain };
      // Hit a text-only fragment with no element parent: keep looking lower.
    }
    return null;
  }
  return walk(tree, []);
}

function anchorHref(chain) {
  for (let i = chain.length - 1; i >= 0; i--) {
    const n = chain[i];
    const name = String(n.localName || n.tagName || "").toLowerCase();
    if (name !== "a") continue;
    const attrs = n.attributes || {};
    const key = Object.keys(attrs).find((k) => String(k).toLowerCase() === "href");
    const href = key ? String(attrs[key] || "").trim() : "";
    if (href) return href;
  }
  return null;
}

/**
 * Dispatch a host canvas click at engine-pixel (x, y) into the guest page.
 * Mirrors the engine's own __dispatchTo semantics (VM-bridged listeners are
 * called with a plain event object; the page re-renders afterwards), but keeps
 * the event so the host can honor preventDefault() for <a> navigation.
 * Returns { hit, tag, id, listenerCount, results, defaultPrevented, href, render }.
 * href is the nearest ancestor <a href> (null when none).
 */
export function clickPageAt(page, x, y) {
  const hit = hitTest(page, x, y);
  if (!hit) return { hit: false, href: null, render: page.lastRender };
  const facade = page.__facade(hit.node);
  const event = {
    type: "click",
    target: facade,
    currentTarget: facade,
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    timeStamp: Date.now(),
    clientX: x,
    clientY: y,
    button: 0,
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() {},
    stopImmediatePropagation() {},
  };
  const results = [];
  const listeners = (facade.__listeners && facade.__listeners.click) || [];
  for (const fn of listeners.slice()) {
    try {
      // Same call convention as the engine's __dispatchTo: a VM-bridged fn
      // runs guest code in the VM when invoked.
      if (typeof fn === "function") fn(event);
      else if (fn && typeof fn.call === "function") fn.call([event]);
      results.push({ ok: true });
    } catch (e) {
      results.push({ ok: false, error: (e && e.message) || String(e) });
    }
  }
  const render = page.render();
  return {
    hit: true,
    tag: String(hit.node.localName || hit.node.tagName || "").toLowerCase(),
    id: (hit.node.attributes && hit.node.attributes.id) || "",
    listenerCount: listeners.length,
    results,
    defaultPrevented: !!event.defaultPrevented,
    href: anchorHref(hit.chain),
    render,
  };
}

/* ---------- extension popup renderer seam ---------- */

let pageEnginePublished = false;
/**
 * Expose window.__merkavaPageEngine for js/extensions-host.js: its popup
 * renderer expects eng.renderPage(html, {width,height,css,js,wasm}) resolving
 * to { data, width, height }. Idempotent — first engine wins.
 */
export function publishPageEngine(engine) {
  if (pageEnginePublished || typeof window === "undefined" || !engine) return;
  window.__merkavaPageEngine = {
    renderPage(html, opts = {}) {
      return Promise.resolve(engine.renderPage(String(html), {
        width: Math.max(1, Math.min(ENGINE_MAX_VIEWPORT.width, Math.floor(opts.width || 400))),
        height: Math.max(1, Math.min(ENGINE_MAX_VIEWPORT.height, Math.floor(opts.height || 300))),
        css: opts.css || "",
        js: false,
        wasm: opts.wasm !== false,
      }));
    },
  };
  pageEnginePublished = true;
}

/** Extract <title> text from raw HTML for tab titles. */
export function extractTitle(html, fallback = "New tab") {
  const m = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i);
  if (m) {
    const t = m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (t) return t.slice(0, 80);
  }
  return fallback;
}

/** Quick capability probe used at boot to show a friendly error instead of a blank screen. */
export function engineSupport() {
  const problems = [];
  if (typeof WebAssembly === "undefined") problems.push("WebAssembly unavailable");
  if (typeof ImageData === "undefined") problems.push("ImageData unavailable");
  return { ok: problems.length === 0, problems };
}
