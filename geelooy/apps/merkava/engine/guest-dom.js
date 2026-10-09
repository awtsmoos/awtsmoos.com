// B"H — Guest DOM facade for the Merkava web build.
//
// Page <script> code runs inside the Merkava VM (never V8 executing guest
// code). The VM needs host objects for document/window, so this module wraps
// the snapshot software DOM (plain objects from htmlParser.js) in small
// DOM-shaped facades. Mutations funnel through a real LayoutScheduler
// (merkava-browser/LayoutScheduler.js), so N script writes between frames
// cost one re-cascade/re-layout/re-paint.
//
// What is real: textContent/innerHTML/class/id/attribute/style writes,
// querySelector(All), addEventListener + host-driven dispatch, canvas
// getContext('2d'/'webgl'/'webgl2') via the real Virtual* contexts, timers.
// What is stubbed (frank): location/navigator (minimal), fetch (host
// passthrough, best-effort), documentElement (the snapshot parser is
// body-rooted, so documentElement aliases body), timers run on a virtual
// clock pumped explicitly via advanceTime(), alert() records only.
import { parseHtmlToDom } from "./merkava-service/snapshots/software/htmlParser.js";
import { buildLayoutTree } from "./merkava-service/snapshots/software/domLayout.js";
import { paintLayout } from "./merkava-service/snapshots/software/domPainter.js";
import { parseInlineStyle } from "./merkava-service/snapshots/software/cascade.js";
import { Framebuffer } from "./merkava-service/snapshots/software/framebuffer.js";
import { parseColor } from "./merkava-service/snapshots/software/color.js";
import { runJsCode } from "./merkava-js-pipeline.js";
import {
  VirtualOffscreenCanvas, VirtualWebGLTextureArena, LayoutScheduler, __registerExternal,
} from "./merkava-webgl.js";
import { renderCanvasSurface, blitPutImageData } from "./merkava-service/snapshots/software/canvasPainter.js";

// The 2D context lazily requires the snapshot canvas painter for
// __rasterize()/getImageData(). Bridge it from the ESM pipeline.
__registerExternal("merkava-service/snapshots/software/canvasPainter.js", {
  renderCanvasSurface, blitPutImageData,
});

export const GUEST_DOM_BACKEND = "merkava-guest-dom/1.0";

const GRAD_RE = /linear-gradient\((.*)\)/i;
const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|\b[a-z]+\b/gi;

function extractCssText(html) {
  return [...String(html || "").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1]).join("\n");
}

/** Inline <script> sources in document order (external src= skipped: no fetching in this build). */
export function extractScripts(html) {
  const clean = String(html || "").replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const attrs = m[1] || "";
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const tm = attrs.match(/\btype\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = ((tm && (tm[2] || tm[3] || tm[4])) || "").toLowerCase();
    if (type && type !== "text/javascript" && type !== "application/javascript") continue;
    if (m[2].trim()) out.push(m[2]);
  }
  return out;
}

const camelToKebab = (p) => String(p).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

function makeTextNode(text) {
  return { tagName: "#text", localName: "#text", nodeType: 3, attributes: {}, children: [], textContent: String(text), style: {} };
}
function makeElementNode(tag) {
  const t = String(tag || "div").toLowerCase();
  return { tagName: t, localName: t, nodeType: 1, attributes: {}, children: [], textContent: "", style: {} };
}
function textOf(node) {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent || "";
  let s = "";
  for (const c of node.children || []) s += textOf(c);
  return s;
}

/* ---------- selector matching (small, honest: tag/#id/.class/[attr] + descendant + comma) ---------- */
function parseSimple(sel) {
  let tag = null, id = null;
  const classes = [], attrs = [];
  const re = /([a-zA-Z][\w-]*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/g;
  let m;
  while ((m = re.exec(sel)) !== null) {
    if (m[1] !== undefined) { if (m[1] !== "*") tag = m[1].toLowerCase(); }
    else if (m[2] !== undefined) id = m[2];
    else if (m[3] !== undefined) classes.push(m[3]);
    else if (m[4] !== undefined) attrs.push({ name: m[4].toLowerCase(), value: m[5] === undefined ? null : m[5] });
  }
  return { tag, id, classes, attrs };
}
function matchesSimple(node, s) {
  if (!node || node.nodeType !== 1) return false;
  if (s.tag && node.localName !== s.tag) return false;
  if (s.id && String(node.attributes.id || "") !== s.id) return false;
  if (s.classes.length || s.attrs.length) {
    const cn = String(node.attributes.class || "").split(/\s+/).filter(Boolean);
    for (const c of s.classes) if (!cn.includes(c)) return false;
    for (const a of s.attrs) {
      if (!(a.name in node.attributes)) return false;
      if (a.value !== null && String(node.attributes[a.name]) !== a.value) return false;
    }
  }
  return true;
}
function queryAllFrom(root, selector) {
  const out = [];
  const groups = String(selector || "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const g of groups) {
    const parts = g.split(/\s+/).filter(Boolean).map(parseSimple);
    if (!parts.length) continue;
    const last = parts[parts.length - 1];
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      if (n.nodeType === 1 && matchesSimple(n, last)) {
        // verify ancestor chain for the remaining parts (right-to-left)
        let anc = n.__parent, pi = parts.length - 2, ok = true;
        while (pi >= 0 && ok) {
          let found = false;
          while (anc) {
            if (matchesSimple(anc, parts[pi])) { found = true; anc = anc.__parent; break; }
            anc = anc.__parent;
          }
          if (!found) ok = false;
          pi--;
        }
        if (ok) out.push(n);
      }
      for (const c of n.children || []) { c.__parent = c.__parent || n; stack.push(c); }
    }
  }
  return out;
}

/* ---------- style proxy ---------- */
function seedInlineStyle(node) {
  if (node.__styleSeeded) return;
  node.__styleSeeded = true;
  const attr = node.attributes.style;
  if (attr) {
    try {
      for (const d of parseInlineStyle(attr)) {
        if (d && d.name && node.style[d.name] === undefined) node.style[d.name] = d.value;
      }
    } catch { /* keep going with what we have */ }
    delete node.attributes.style;
  }
}
function makeStyleProxy(el) {
  const node = el.__node, page = el.__page;
  return new Proxy({}, {
    get(_, prop) {
      if (prop === "cssText") {
        seedInlineStyle(node);
        return Object.entries(node.style).map(([k, v]) => `${k}: ${v}`).join("; ");
      }
      if (typeof prop !== "string") return undefined;
      seedInlineStyle(node);
      const v = node.style[camelToKebab(prop)];
      return v === undefined ? "" : v;
    },
    set(_, prop, value) {
      if (typeof prop !== "string") return false;
      if (prop === "cssText") {
        seedInlineStyle(node);
        node.style = {};
        const text = String(value || "");
        for (const part of text.split(";")) {
          const ci = part.indexOf(":");
          if (ci > 0) node.style[part.slice(0, ci).trim().toLowerCase()] = part.slice(ci + 1).trim();
        }
        page.__noteStyle(node, "cssText");
        return true;
      }
      seedInlineStyle(node);
      node.style[camelToKebab(prop)] = String(value);
      page.__noteStyle(node, camelToKebab(prop));
      return true;
    },
    ownKeys() { seedInlineStyle(node); return Object.keys(node.style); },
    getOwnPropertyDescriptor(_, prop) {
      seedInlineStyle(node);
      const k = camelToKebab(prop);
      if (k in node.style) return { configurable: true, enumerable: true, value: node.style[k], writable: true };
      return undefined;
    },
  });
}

/* ---------- element facade ---------- */
class GuestElement {
  constructor(node, page) {
    this.__node = node;
    this.__page = page;
    this.__listeners = {};
    this.__styleProxy = null;
  }
  get tagName() { return String(this.__node.tagName || "").toUpperCase(); }
  get localName() { return this.__node.localName || ""; }
  get nodeType() { return this.__node.nodeType || 1; }
  get id() { return String(this.__node.attributes.id || ""); }
  set id(v) { this.setAttribute("id", v); }
  get className() { return String(this.__node.attributes.class || ""); }
  set className(v) { this.setAttribute("class", v); }
  get parentNode() { const p = this.__node.__parent; return p ? this.__page.__facade(p) : null; }
  get children() { return (this.__node.children || []).filter((c) => c.nodeType === 1).map((c) => this.__page.__facade(c)); }
  get childNodes() { return (this.__node.children || []).map((c) => this.__page.__facade(c)); }
  get firstChild() { const c = (this.__node.children || [])[0]; return c ? this.__page.__facade(c) : null; }
  get textContent() { return textOf(this.__node); }
  set textContent(v) {
    this.__node.children = [makeTextNode(v)];
    this.__page.__noteText();
  }
  get innerHTML() {
    return (this.__node.children || []).map(serializeNode).join("");
  }
  set innerHTML(v) {
    const frag = parseHtmlToDom(`<body>${String(v || "")}</body>`);
    this.__node.children = frag.children || [];
    this.__page.__noteStructure();
  }
  get style() {
    if (!this.__styleProxy) this.__styleProxy = makeStyleProxy(this);
    return this.__styleProxy;
  }
  getAttribute(name) {
    const k = String(name || "").toLowerCase();
    seedInlineStyle(this.__node);
    const v = this.__node.attributes[k];
    return v === undefined ? null : String(v);
  }
  setAttribute(name, value) {
    const k = String(name || "").toLowerCase();
    this.__node.attributes[k] = String(value);
    this.__page.__noteAttr(this.__node, k);
  }
  removeAttribute(name) {
    const k = String(name || "").toLowerCase();
    delete this.__node.attributes[k];
    if (k === "style") this.__node.__styleSeeded = true;
    this.__page.__noteAttr(this.__node, k);
  }
  hasAttribute(name) { return String(name || "").toLowerCase() in this.__node.attributes; }
  appendChild(child) {
    const n = child && child.__node ? child.__node : child;
    n.__parent = this.__node;
    (this.__node.children || (this.__node.children = [])).push(n);
    this.__page.__noteStructure();
    return child;
  }
  removeChild(child) {
    const n = child && child.__node ? child.__node : child;
    const i = (this.__node.children || []).indexOf(n);
    if (i >= 0) this.__node.children.splice(i, 1);
    n.__parent = null;
    this.__page.__noteStructure();
    return child;
  }
  insertBefore(child, ref) {
    const n = child && child.__node ? child.__node : child;
    const r = ref && ref.__node ? ref.__node : ref;
    n.__parent = this.__node;
    const kids = this.__node.children || (this.__node.children = []);
    const i = r ? kids.indexOf(r) : -1;
    if (i >= 0) kids.splice(i, 0, n); else kids.push(n);
    this.__page.__noteStructure();
    return child;
  }
  addEventListener(type, fn) {
    const t = String(type || "");
    (this.__listeners[t] || (this.__listeners[t] = [])).push(fn);
  }
  removeEventListener(type, fn) {
    const t = String(type || "");
    const l = this.__listeners[t];
    if (l) this.__listeners[t] = l.filter((x) => x !== fn);
  }
  dispatchEvent(event) {
    const type = (event && event.type) || String(event || "");
    return this.__page.__dispatchTo(this, type, event);
  }
  click() { return this.__page.__dispatchTo(this, "click", { clientX: 0, clientY: 0, button: 0 }); }
  querySelector(sel) {
    const hits = queryAllFrom(this.__node, sel);
    return hits.length ? this.__page.__facade(hits[0]) : null;
  }
  querySelectorAll(sel) {
    return queryAllFrom(this.__node, sel).map((n) => this.__page.__facade(n));
  }
  getContext(kind) {
    if (this.__node.localName !== "canvas") return null;
    return this.__page.__canvasContext(this.__node, kind);
  }
  get width() { return Number(this.__node.attributes.width || 300); }
  get height() { return Number(this.__node.attributes.height || 150); }
}
function serializeNode(node) {
  if (!node) return "";
  if (node.nodeType === 3) return String(node.textContent || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const attrs = Object.entries(node.attributes || {}).map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`).join("");
  const kids = (node.children || []).map(serializeNode).join("");
  return `<${node.localName}${attrs}>${kids}</${node.localName}>`;
}

/* ---------- document facade ---------- */
class GuestDocument {
  constructor(page) { this.__page = page; }
  get body() { return this.__page.__facade(this.__page.dom); }
  get documentElement() { return this.body; } // snapshot parser is body-rooted (frank stub)
  get readyState() { return "complete"; }
  get title() { return ""; }
  getElementById(id) {
    const hits = queryAllFrom(this.__page.dom, "#" + String(id || ""));
    return hits.length ? this.__page.__facade(hits[0]) : null;
  }
  getElementsByTagName(tag) { return this.querySelectorAll(String(tag || "*")); }
  getElementsByClassName(cls) {
    return this.querySelectorAll(String(cls || "").trim().split(/\s+/).filter(Boolean).map((c) => "." + c).join(""));
  }
  querySelector(sel) {
    const hits = queryAllFrom(this.__page.dom, sel);
    return hits.length ? this.__page.__facade(hits[0]) : null;
  }
  querySelectorAll(sel) {
    return queryAllFrom(this.__page.dom, sel).map((n) => this.__page.__facade(n));
  }
  createElement(tag) { return this.__page.__facade(makeElementNode(tag)); }
  createTextNode(text) { return this.__page.__facade(makeTextNode(text)); }
  addEventListener(type, fn) { this.body.addEventListener(type, fn); }
  removeEventListener(type, fn) { this.body.removeEventListener(type, fn); }
  dispatchEvent(event) { return this.body.dispatchEvent(event); }
}

/* ---------- window facade ---------- */
class GuestWindow {
  constructor(page) {
    this.__page = page;
    this.__alerts = [];
  }
  get document() { return this.__page.document; }
  get window() { return this; }
  get self() { return this; }
  get location() { return { href: "about:blank", protocol: "about:", host: "", pathname: "blank" }; } // stub
  get navigator() { return { userAgent: "Merkava/1.0 (from scratch)", language: "en-US" }; } // stub
  get console() { return console; }
  get innerWidth() { return this.__page.width; }
  get innerHeight() { return this.__page.height; }
  alert(msg) { this.__alerts.push(String(msg)); } // recorded, no dialog (frank stub)
  setTimeout(fn, ms, ...args) { return this.__page.__setTimeout(fn, ms, 0, args); }
  clearTimeout(id) { return this.__page.__clearTimer(id); }
  setInterval(fn, ms, ...args) { return this.__page.__setTimeout(fn, ms, Math.max(1, Number(ms) || 0), args); }
  clearInterval(id) { return this.__page.__clearTimer(id); }
  requestAnimationFrame(fn) { return this.__page.__setTimeout((t) => fn(t), 16, 0, [this.__page.__now + 16]); }
  cancelAnimationFrame(id) { return this.__page.__clearTimer(id); }
  fetch(url, opts) {
    // Best-effort host passthrough. Async completion runs guest continuations
    // as host microtasks through the VM bridge.
    const hf = typeof fetch === "function" ? fetch : null;
    if (!hf) return Promise.reject(new Error("fetch is not available in this host"));
    return hf(String(url), opts).then((r) => ({
      ok: r.ok, status: r.status, url: r.url,
      text: () => r.text(),
      json: () => r.json(),
    }));
  }
}

/* ---------- framebuffer (same WASM-backed surface as the static entry) ---------- */
class GuestFramebuffer extends Framebuffer {
  constructor(w, h, bg, px) {
    super(w, h, [0, 0, 0, 0]);
    this.px = px;
    const need = w * h * 4;
    if (px.memory.buffer.byteLength < need) throw new Error("viewport exceeds WASM memory");
    this.data = new Uint8ClampedArray(px.memory.buffer, 0, need);
    this.clear(bg);
  }
  clear(c) {
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
    super.gradientRect(x, y, w, h, background, fallback);
  }
}

/* ---------- the interactive page ---------- */
class InteractivePage {
  constructor(dom, opts) {
    this.dom = dom;
    this.width = opts.width;
    this.height = opts.height;
    this.cssText = opts.cssText;
    this.px = opts.px;
    this.__facades = new WeakMap();
    this.__canvases = new Map(); // snapshot node -> VirtualOffscreenCanvas
    // One texture arena per page (like a browser's GPU process): texture ids
    // are arena-scoped, and the painter's dedupe set keys on texture.id, so
    // per-canvas arenas would collide ids across canvases.
    this.__arena = new VirtualWebGLTextureArena();
    this.__timers = new Map();
    this.__timerSeq = 0;
    this.__now = 0;
    this.__scriptRuns = [];
    this.document = new GuestDocument(this);
    this.window = new GuestWindow(this);
    // Real LayoutScheduler batching: script writes only mark state dirty;
    // render() flushes through one re-cascade/re-layout.
    const sched = new LayoutScheduler();
    const adapter = {
      tree: null,
      layout: (vp) => {
        const t = buildLayoutTree(this.dom, { width: vp.width, height: vp.height }, { cssText: this.cssText });
        adapter.tree = t;
        return t;
      },
    };
    sched.attachEngine(adapter, () => ({ width: this.width, height: this.height }));
    this.__sched = sched;
    this.__adapter = adapter;
    this.lastRender = null;
  }

  __facade(node) {
    if (!node) return null;
    if (node.__guestFacade) return node.__guestFacade;
    let f = this.__facades.get(node);
    if (!f) {
      f = new GuestElement(node, this);
      this.__facades.set(node, f);
      node.__guestFacade = f;
    }
    return f;
  }

  /* ----- mutation notes -> scheduler ----- */
  __noteStructure() { this.__sched.noteStructureChange(); }
  __noteText() { this.__sched.noteTextChange(); }
  __noteAttr(node, name) { this.__sched.noteAttributeChange(node, name); }
  __noteStyle(node, prop) { this.__sched.noteStyleChange(node, prop); }

  /* ----- timers: virtual clock, pumped explicitly ----- */
  __setTimeout(fn, ms, repeat, args) {
    const id = ++this.__timerSeq;
    const callable = typeof fn === "function" ? () => fn(...args) : () => {};
    this.__timers.set(id, { id, fn: callable, due: this.__now + Math.max(0, Number(ms) || 0), repeat });
    return id;
  }
  __clearTimer(id) { this.__timers.delete(id); }
  advanceTime(ms) {
    const end = this.__now + Math.max(0, Number(ms) || 0);
    let guard = 100000;
    while (guard-- > 0) {
      let next = null;
      for (const t of this.__timers.values()) {
        if (t.due <= end && (!next || t.due < next.due)) next = t;
      }
      if (!next) break;
      this.__now = next.due;
      this.__timers.delete(next.id);
      next.fn();
      if (next.repeat > 0) {
        next.due = this.__now + next.repeat;
        this.__timers.set(next.id, next);
      }
    }
    this.__now = end;
    return this.render();
  }

  /* ----- canvas ----- */
  __canvasContext(node, kind) {
    const type = String(kind || "").toLowerCase();
    if (type !== "2d" && type !== "webgl" && type !== "webgl2" && type !== "experimental-webgl") return null;
    let off = this.__canvases.get(node);
    if (!off) {
      const w = Math.max(1, parseInt(node.attributes.width, 10) || 300);
      const h = Math.max(1, parseInt(node.attributes.height, 10) || 150);
      off = new VirtualOffscreenCanvas(w, h, null, this.__arena);
      this.__canvases.set(node, off);
    }
    return off.getContext(type);
  }
  __collectTextures() {
    const out = [];
    for (const off of this.__canvases.values()) {
      if (off.__webglContext && off.__webglCanvasTexture) {
        const t = off.__webglCanvasTexture;
        if (t.glPixels) out.push(t);
        else if (t.commands && t.commands.length) out.push(t);
      } else if (off.__canvas2dContext && off.__canvas2dContext.texture) {
        out.push(off.__canvas2dContext.texture);
      }
    }
    return out;
  }

  /* ----- events ----- */
  __dispatchTo(facade, type, init) {
    const t = String(type || "");
    const event = {
      type: t, target: facade, currentTarget: facade,
      bubbles: !!(init && init.bubbles), cancelable: !!(init && init.cancelable),
      defaultPrevented: false, timeStamp: Date.now(),
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() {}, stopImmediatePropagation() {},
      ...(init || {}),
    };
    const results = [];
    for (const fn of (facade.__listeners[t] || []).slice()) {
      try {
        // fn arrived bridged from the VM: calling it runs guest code in the VM.
        if (typeof fn === "function") fn(event);
        else if (fn && typeof fn.call === "function") fn.call([event]);
        results.push({ ok: true });
      } catch (e) {
        results.push({ ok: false, error: e && e.message });
      }
    }
    const render = this.render();
    return { results, render };
  }
  click(selector) {
    const el = typeof selector === "string" ? this.document.querySelector(selector) : selector;
    if (!el) throw new Error("click: no such element " + selector);
    return this.__dispatchTo(el, "click", { clientX: 0, clientY: 0, button: 0, bubbles: true });
  }
  dispatchEvent(type, selector, init) {
    const el = typeof selector === "string" ? this.document.querySelector(selector) : selector || this.document.body;
    if (!el) throw new Error("dispatchEvent: no such element " + selector);
    return this.__dispatchTo(el, type, init);
  }

  /* ----- scripts: guest code runs in the Merkava VM, never V8 ----- */
  async __runScripts(sources) {
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const globals = {
        document: this.document,
        window: this.window,
        self: this.window,
      };
      globals.globalThis = this.window;
      let res;
      try {
        res = await runJsCode(String(src), { globals, label: `<page-script ${i}>` });
      } catch (e) {
        res = { ok: false, status: "COMPILE-FAILED", error: e && e.message };
      }
      this.__scriptRuns.push({
        index: i, ok: !!res.ok, status: res.status || null,
        error: res.error || null,
      });
    }
    return this.__scriptRuns;
  }
  get scriptRuns() { return this.__scriptRuns.slice(); }

  /* ----- render ----- */
  render() {
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const s = this.__sched;
    // The scheduler is the mutation funnel: any dirty flag (layout, paint,
    // compositor) means re-cascade/re-layout. Clean frames reuse the
    // retained tree with zero pipeline work.
    let layout;
    if (s.needsLayout() || s.paintDirty.size > 0 || s.compositorDirty.size > 0) {
      layout = s.forceLayout({ width: this.width, height: this.height });
      s.paintDirty.clear();
      s.compositorDirty.clear();
    } else {
      layout = this.__adapter.tree;
    }
    const fb = new GuestFramebuffer(this.width, this.height, [255, 255, 255, 255], this.px);
    // B"H: pass the RAW framebuffer, not the ScaledFramebuffer wrapper.
    // Scale is 1 here so it is pixel-identical — and the repo's
    // webglWitness.blitPixels calls fb.setPixel, which only exists on the
    // raw Framebuffer (latent repo bug: the static path never passes real
    // canvas textures, so it never hit this).
    paintLayout(fb, layout, { textures: this.__collectTextures() });
    const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
    this.lastRender = {
      data: fb.data, width: this.width, height: this.height,
      ms: t1 - t0, layoutItems: layout ? layout.length : 0,
      backend: GUEST_DOM_BACKEND,
    };
    return this.lastRender;
  }

  /* ----- pixel helpers (for tests/embedders) ----- */
  countPixels(pred) {
    const d = this.lastRender.data, out = { n: 0 };
    for (let i = 0; i < d.length; i += 4) {
      if (pred(d[i], d[i + 1], d[i + 2], d[i + 3])) out.n++;
    }
    return out.n;
  }
}

const MAX_VIEWPORT = { width: 1920, height: 1200 };

/**
 * Build an interactive page: parse -> run <script>s in the Merkava VM ->
 * first render. Mirrors browser load order (parse, scripts, first paint).
 */
export async function createInteractivePage(html, opts = {}) {
  if (!opts.px) throw new Error("createInteractivePage requires opts.px (pixel-wasm module)");
  const width = Math.max(1, Math.min(MAX_VIEWPORT.width, opts.width || 960));
  const height = Math.max(1, Math.min(MAX_VIEWPORT.height, opts.height || 640));
  const cssText = extractCssText(html) + "\n" + (opts.css || "");
  const dom = parseHtmlToDom(html);
  const page = new InteractivePage(dom, { width, height, cssText, px: opts.px });
  await page.__runScripts(extractScripts(html));
  page.render();
  return page;
}
