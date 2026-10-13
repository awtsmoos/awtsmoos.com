// B"H
/**
 * @file verifySession.js
 * @description Scriptable visual-verification + interaction-simulation sessions
 * for Merkava's native software renderer. Zero Chrome.
 *
 * A VerifySession parses HTML once, then runs an interaction script:
 * clicks/taps (coordinate hit-testing through the real layout), hovers,
 * keyboard input, scroll, DOM state flips (simulating what a JS handler
 * would do — the renderer executes no page JS), assertions, and screenshots.
 *
 * Speed: warm session (no node re-spawn per shot), cached layout (rebuilt
 * only when the DOM/viewport changes), compositor scroll (full-page paint
 * once, viewport crops are memcpy), fast zlib level option.
 *
 * Interaction mini-language (for --interact "a;b;c"):
 *   shot[:path.png]            render + save screenshot
 *   click:x,y | click:.sel      tap at viewport coords or selector center
 *   tap:...                     alias for click
 *   hover:x,y | hover:.sel
 *   dblclick:x,y | dblclick:.sel
 *   scroll:dy                   scroll viewport by dy px (compositor-fast)
 *   scrollto:y                  scroll viewport to absolute y
 *   type:.sel:some text         focus + type (use \; for a literal semicolon)
 *   press:Enter                 key press (Enter/Tab/Backspace/single char)
 *   wait:ms                     pause (e.g. for animation `time` steps)
 *   state:.sel:+open            add class (simulate handler effect)
 *   state:.sel:-open            remove class
 *   state:.sel:~open            toggle class
 *   hide:.sel / show:.sel       display:none on/off
 *   attr:.sel:name=value        set attribute
 *   style:.sel:prop=value       set inline style property
 *   assert:visible:.sel         FAIL the run if not visible
 *   assert:hidden:.sel          FAIL the run if visible
 *   assert:text:.sel:substring  FAIL if text not found
 *   assert:bg:.sel:#rrggbb      FAIL if background-color differs
 *   viewport:390x844           resize mid-script
 *   log:message                 note in the report
 */
import { writeFileSync } from "fs";
import { InputSimulator } from "./software/inputSimulator.js";
import { buildLayoutTree } from "./software/domLayout.js";
import { paintLayout } from "./software/domPainter.js";
import { makeSupersampledSurface, downsampleToPng, ScaledFramebuffer } from "./software/supersample.js";
import { background } from "./software/dom-painter/styleTools.js";
import { Framebuffer } from "./software/framebuffer.js";

export const VIEWPORT_PRESETS = {
  iphone14: { width: 390, height: 844, dpr: 3, label: "iPhone 14" },
  iphoneSE: { width: 375, height: 667, dpr: 2, label: "iPhone SE" },
  pixel8:   { width: 412, height: 915, dpr: 2, label: "Pixel 8" },
  android:  { width: 360, height: 740, dpr: 3, label: "Android" },
  tablet:   { width: 820, height: 1180, dpr: 2, label: "Tablet" },
  desktop:  { width: 1280, height: 800, dpr: 1, label: "Desktop" },
  fhd:      { width: 1920, height: 1080, dpr: 1, label: "Full HD" },
};

const TALL_CAP = 12000;

function clampInt(v, lo, hi, fb) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return fb;
  return Math.max(lo, Math.min(hi, n));
}

function matchesSel(node, sel) {
  const s = String(sel).trim();
  if (!node || node.nodeType !== 1) return false;
  if (s.startsWith("#")) return node.attributes?.id === s.slice(1);
  if (s.startsWith(".")) {
    const cls = String(node.attributes?.class || "").split(/\s+/);
    return cls.includes(s.slice(1));
  }
  return node.localName === s.toLowerCase();
}

function normColor(c) {
  return String(c || "").trim().toLowerCase().replace(/\s+/g, "");
}

export class VerifySession extends InputSimulator {
  constructor(html, options = {}) {
    super(html, { width: options.width || 960, height: options.height || 640 });
    this.quiet(true); // no auto-render; explicit shots only
    this.dpr = clampInt(options.dpr || 1, 1, 3);
    this.pngLevel = options.pngLevel == null ? undefined : clampInt(options.pngLevel, 0, 9);
    this.scrollY = 0;
    this._dirty = true;
    this._layoutCache = null;
    this._vpCache = null;   // viewport-sized paint cache
    this._tallCache = null; // full-page paint cache (scroll compositor)
    this._fixedRootCache = null;
    this._tallNeeded = false;
    this._shotCount = 0;
    this.timings = { layout: 0, paint: 0, encode: 0, renders: 0 };
  }

  /* ---------------- viewport ---------------- */

  setViewport(width, height, dpr) {
    this.width = clampInt(width, 1, 4096, this.width);
    this.height = clampInt(height, 1, 4096, this.height);
    if (dpr != null) this.dpr = clampInt(dpr, 1, 3);
    this.scrollY = 0;
    this._markDirty();
    return this;
  }

  /* ---------------- layout cache ---------------- */

  _markDirty() {
    this._dirty = true;
    this._layoutCache = null;
    this._vpCache = null;
    this._tallCache = null;
    this._fixedRootCache = null;
  }

  _layoutItems() {
    if (!this._dirty && this._layoutCache) return this._layoutCache;
    const t0 = Date.now();
    // Tall layout: one layout serves every scroll position.
    const tallH = Math.min(TALL_CAP, Math.max(this.height, this._estContentH || this.height * 4));
    const layout = buildLayoutTree(
      this._dom,
      { width: this.width, height: tallH },
      { cssText: this._cssText, time: 0 }
    );
    this.timings.layout += Date.now() - t0;
    this._layoutCache = layout;
    // Parent map from the items' own children arrays (deep-copied text
    // nodes lose __simParent, so the canonical-DOM walk can't see them).
    const pm = new Map();
    for (const it of layout) {
      for (const ch of it?.children || []) if (ch && !pm.has(ch)) pm.set(ch, it);
    }
    this._parentMap = pm;
    this._dirty = false;
    // Measure true content height for scroll clamping.
    let max = 0;
    for (let i = 1; i < layout.length; i++) {
      const it = layout[i];
      if (!it) continue;
      const b = (Number(it.y) || 0) + (Number(it.height) || 0);
      if (b > max) max = b;
    }
    this._estContentH = Math.ceil(max);
    return layout;
  }

  // Mutating ops invalidate the cache.
  mousedown(...a) { const r = super.mousedown(...a); this._markDirty(); return r; }
  mouseup(...a) { const r = super.mouseup(...a); this._markDirty(); return r; }
  dblclick(...a) { const r = super.dblclick(...a); this._markDirty(); return r; }
  drag(...a) { const r = super.drag(...a); this._markDirty(); return r; }
  focus(...a) { const r = super.focus(...a); this._markDirty(); return r; }
  blur(...a) { const r = super.blur(...a); this._markDirty(); return r; }
  tab(...a) { const r = super.tab(...a); this._markDirty(); return r; }
  press(...a) { const r = super.press(...a); this._markDirty(); return r; }
  type(...a) { const r = super.type(...a); this._markDirty(); return r; }
  _setHover(...a) { const r = super._setHover(...a); this._markDirty(); return r; }

  /** hitTest in viewport coords: fixed overlay first, then page content. */
  hitTest(x, y) {
    const layout = this._layoutItems();
    for (let i = layout.length - 1; i >= 0; i--) {
      const it = layout[i];
      if (!it || it.width <= 0 || it.height <= 0) continue;
      const b = this._effViewportBox(it);
      if (b) {
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
          const el = this._canonicalOf(it);
          if (el) return el;
        }
        continue;
      }
      // Regular page content (page coords).
      const py = y + this.scrollY;
      if (x >= it.x && x <= it.x + it.width && py >= it.y && py <= it.y + it.height) {
        const el = this._canonicalOf(it);
        if (el) return el;
      }
    }
    return null;
  }

  /** position:fixed items live in viewport space, not page space. */
  _isFixed(it) {
    return String(it?.style?.position || "").toLowerCase() === "fixed";
  }

  /** Canonical nodes that are fixed roots -> their layout item. Cached per layout. */
  _fixedRoots() {
    if (this._fixedRootCache && !this._dirty) return this._fixedRootCache;
    const map = new Map();
    for (const it of this._layoutItems()) {
      if (this._isFixed(it)) {
        const el = this._elementForItem(it);
        if (el) map.set(el, it);
      }
    }
    this._fixedRootCache = map;
    return map;
  }

  /** If a canonical node sits inside a fixed subtree, return the viewport delta. */
  _fixedAdjustment(canonicalNode) {
    const roots = this._fixedRoots();
    let n = canonicalNode, depth = 0;
    while (n && depth++ < 60) {
      if (roots.has(n)) {
        const rootIt = roots.get(n);
        const vp = this._fixedViewportBox(rootIt);
        return { dx: vp.x - rootIt.x, dy: vp.y - rootIt.y };
      }
      n = n.__simParent || null;
    }
    return null;
  }

  /** Cached simId -> canonical node map (parent walks the whole DOM per lookup). */
  _nodeBySimId(id) {
    if (!this._simIdMap) {
      const m = new Map();
      for (const n of this._walk(this._dom)) if (n.__simId) m.set(n.__simId, n);
      this._simIdMap = m;
    }
    return this._simIdMap.get(id) || null;
  }

  /** Canonical DOM node for a layout item (text nodes resolve via parent). */
  _canonicalOf(it) {
    let cur = it, depth = 0;
    while (cur && depth++ < 64) {
      const el = this._elementForItem(cur);
      if (el) return el;
      cur = this._parentMap ? this._parentMap.get(cur) : null;
    }
    return null;
  }

  /**
   * Viewport-space box for an item, or null when the item is regular
   * page content. Handles items nested inside fixed subtrees (e.g. a
   * close button inside a bottom sheet).
   */
  _effViewportBox(it) {
    if (this._isFixed(it)) return this._fixedViewportBox(it);
    const el = this._canonicalOf(it);
    const adj = el && this._fixedAdjustment(el);
    if (adj) return { ...it, x: it.x + adj.dx, y: it.y + adj.dy };
    return null;
  }

  _inFixedSubtree(it) {
    if (this._isFixed(it)) return true;
    const el = this._canonicalOf(it);
    return !!(el && this._fixedAdjustment(el));
  }

  _fixedViewportBox(it) {
    const st = it.style || {};
    const px = (v) => { const m = String(v ?? "").trim().match(/^(-?[\d.]+)px$/); return m ? +m[1] : 0; };
    const set = (v) => v != null && String(v).trim() !== "" && String(v).trim().toLowerCase() !== "auto";
    const y = set(st.bottom) ? this.height - it.height - px(st.bottom) : px(st.top);
    const x = set(st.right) ? this.width - it.width - px(st.right) : px(st.left);
    return { ...it, x, y };
  }

  _paintFixedOverlay(scaledSurface) {
    // Mutate coords in place (restored afterwards): the painter resolves
    // ancestor clip/position context through item.node, so adjusted copies
    // with shared node refs would paint against stale page-space parents.
    // TWO PASSES: compute every box from pristine coords first — mutating
    // the fixed root before its children are measured corrupts their delta.
    const plan = [];
    for (const it of this._layoutItems()) {
      if (!it || it.width <= 0 || it.height <= 0) continue;
      const b = this._effViewportBox(it);
      if (b) plan.push([it, b.x, b.y]);
    }
    const saved = plan.map(([it]) => [it, it.x, it.y]);
    for (const [it, x, y] of plan) { it.x = x; it.y = y; }
    const items = plan.map(([it]) => it);
    try {
      // Simple-paint lane: no ancestor transform/clip accumulation — the
      // overlay boxes already carry final viewport coords.
      if (items.length) paintLayout(scaledSurface, items, {}, { simplePaint: true });
    } finally {
      for (const [it, x, y] of saved) { it.x = x; it.y = y; }
    }
    return items.length;
  }

  /** Viewport coords of a selector's center (fixed-aware, for driving clicks). */
  viewportCenterOf(selector) {
    const target = this._findAll(selector)[0];
    if (!target) return null;
    const layout = this._layoutItems();
    for (let i = layout.length - 1; i >= 0; i--) {
      const it = layout[i];
      if (this._elementForItem(it) === target && it.width > 0 && it.height > 0) {
        const b = this._effViewportBox(it);
        if (b) return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), node: target };
        return { x: Math.round(it.x + it.width / 2), y: Math.round(it.y - this.scrollY + it.height / 2), node: target };
      }
    }
    return null;
  }

  /* ---------------- scroll (compositor) ---------------- */

  maxScrollY() {
    this._layoutItems();
    return Math.max(0, (this._estContentH || this.height) - this.height);
  }

  scrollTo(y) {
    const ny = clampInt(y, 0, this.maxScrollY(), 0);
    this.scrollY = ny;
    // Tall paint only pays off while scrolled; drop back to the cheap
    // viewport paint when returning to the top.
    this._tallNeeded = ny > 0;
    return this.scrollY;
  }

  scrollBy(dy) {
    return this.scrollTo(this.scrollY + Number(dy || 0));
  }

  /* ---------------- DOM state helpers (simulate handler effects) ---------------- */

  _findAll(selector) {
    return this._walk(this._dom).filter((n) => n.nodeType === 1 && matchesSel(n, selector));
  }

  _classes(node) {
    return String(node.attributes?.class || "").split(/\s+/).filter(Boolean);
  }

  addClass(selector, cls) {
    for (const n of this._findAll(selector)) {
      const c = this._classes(n);
      if (!c.includes(cls)) c.push(cls);
      n.attributes.class = c.join(" ");
    }
    this._markDirty();
    return this;
  }

  removeClass(selector, cls) {
    for (const n of this._findAll(selector)) {
      n.attributes.class = this._classes(n).filter((c) => c !== cls).join(" ");
    }
    this._markDirty();
    return this;
  }

  toggleClass(selector, cls) {
    for (const n of this._findAll(selector)) {
      const c = this._classes(n);
      n.attributes.class = c.includes(cls) ? c.filter((x) => x !== cls).join(" ") : [...c, cls].join(" ");
    }
    this._markDirty();
    return this;
  }

  setAttr(selector, name, value) {
    for (const n of this._findAll(selector)) {
      n.attributes = n.attributes || {};
      if (value == null) delete n.attributes[name];
      else n.attributes[name] = String(value);
    }
    this._markDirty();
    return this;
  }

  setStyle(selector, prop, value) {
    for (const n of this._findAll(selector)) {
      n.style = n.style || {};
      n.style[prop] = String(value);
    }
    this._markDirty();
    return this;
  }

  setHidden(selector, hidden) {
    return this.setStyle(selector, "display", hidden ? "none" : "");
  }

  setValue(selector, value) {
    for (const n of this._findAll(selector)) n.value = String(value);
    this._markDirty();
    return this;
  }

  /* ---------------- render ---------------- */

  _bodyBg(layout) {
    const body = layout.find((it) => it && it.kind === "body") || layout[0] || {};
    return background(body.style || {}, { kind: "body" });
  }

  _paintTall() {
    if (this._tallCache && !this._dirty) return this._tallCache;
    const layout = this._layoutItems().filter((it) => !this._inFixedSubtree(it));
    const tallH = Math.max(this.height, Math.min(TALL_CAP, this._estContentH || this.height));
    const t0 = Date.now();
    const bodyBg = this._bodyBg(this._layoutItems());
    const { base, surface } = makeSupersampledSurface(this.width, tallH, this.dpr, bodyBg.color);
    if (bodyBg.gradient) surface.gradientRect(0, 0, this.width, tallH, bodyBg.gradient, bodyBg.color);
    paintLayout(surface, layout, {});
    this.timings.paint += Date.now() - t0;
    this._tallCache = { base, tallH };
    return this._tallCache;
  }

  _paintViewport() {
    if (this._vpCache && !this._dirty) return this._vpCache;
    const all = this._layoutItems();
    const layout = all.filter((it) => !this._inFixedSubtree(it));
    const t0 = Date.now();
    const bodyBg = this._bodyBg(all);
    const { base, surface } = makeSupersampledSurface(this.width, this.height, this.dpr, bodyBg.color);
    if (bodyBg.gradient) surface.gradientRect(0, 0, this.width, this.height, bodyBg.gradient, bodyBg.color);
    paintLayout(surface, layout, {});
    this.timings.paint += Date.now() - t0;
    this._vpCache = { base };
    return this._vpCache;
  }

  /**
   * Viewport paint at an arbitrary scrollY (for dpr>1, where a tall cache
   * costs 9x pixels). Items are translated to viewport space via proxies;
   * children arrays are repaired so z-order walks stay consistent.
   */
  _paintViewportAt(scrollY) {
    const all = this._layoutItems();
    const y0 = scrollY, y1 = scrollY + this.height;
    const origToProxy = new Map();
    const translated = [];
    for (const it of all) {
      if (!it || this._inFixedSubtree(it)) continue;
      if (it.y + it.height < y0 || it.y > y1) continue;
      const proxy = { ...it, y: it.y - scrollY };
      origToProxy.set(it, proxy);
      translated.push(proxy);
    }
    for (const proxy of translated) {
      const ch = proxy.children;
      if (ch && ch.length) {
        let dirty = false;
        const mapped = new Array(ch.length);
        for (let i = 0; i < ch.length; i++) {
          const m = origToProxy.get(ch[i]);
          mapped[i] = m || ch[i];
          if (m) dirty = true;
        }
        if (dirty) proxy.children = mapped;
      }
    }
    const t0 = Date.now();
    const bodyBg = this._bodyBg(all);
    const { base, surface } = makeSupersampledSurface(this.width, this.height, this.dpr, bodyBg.color);
    if (bodyBg.gradient) surface.gradientRect(0, 0, this.width, this.height, bodyBg.gradient, bodyBg.color);
    paintLayout(surface, translated, {});
    this.timings.paint += Date.now() - t0;
    return { base };
  }

  /** Render the current viewport (at scrollY) to a PNG buffer. */
  renderFrame() {
    const t0 = Date.now();
    const dpr = this.dpr;
    const vw = this.width * dpr, vh = this.height * dpr;
    // Fresh copy each frame: the fixed overlay paints onto the copy so the
    // cached bases stay clean for the next frame.
    const viewBase = new Framebuffer(vw, vh);
    const scrolled = this.scrollY > 0 && this.maxScrollY() > 0;
    if (scrolled && this.dpr <= 1 && this._tallNeeded) {
      // Compositor scroll (dpr=1 only): one tall paint, viewport crops are memcpy.
      viewBase.blitRaw(this._paintTall().base, 0, Math.round(this.scrollY * dpr), vw, vh, 0, 0);
    } else if (scrolled) {
      // dpr>1: translated viewport repaint (a tall cache would cost 9x pixels).
      viewBase.blitRaw(this._paintViewportAt(this.scrollY).base, 0, 0, vw, vh, 0, 0);
    } else {
      viewBase.blitRaw(this._paintViewport().base, 0, 0, vw, vh, 0, 0);
    }
    // Fixed overlay in screen space (sheets, headers, close buttons).
    this._paintFixedOverlay(new ScaledFramebuffer(viewBase, dpr, this.width, this.height));
    const t1 = Date.now();
    const png = downsampleToPng(viewBase, dpr, this.width, this.height, this.pngLevel);
    this.timings.encode += Date.now() - t1;
    this.timings.renders++;
    this._dirty = false;
    return { png, width: this.width, height: this.height, ms: Date.now() - t0, scrollY: this.scrollY };
  }

  // Keep the InputSimulator contract: render() -> lastResult, savePng(path).
  render() {
    const f = this.renderFrame();
    this.lastResult = {
      backend: "merkava-verify-session",
      width: f.width, height: f.height,
      bytes: f.png.length,
      dataUrl: "data:image/png;base64," + f.png.toString("base64"),
    };
    return this.lastResult;
  }

  savePng(path) {
    const f = this.renderFrame();
    writeFileSync(path, f.png);
    this._shotCount++;
    return { path, bytes: f.png.length, ms: f.ms };
  }

  /* ---------------- assertions ---------------- */

  _nodeBoxes(selector) {
    const targets = new Set(this._findAll(selector));
    const out = [];
    for (const it of this._layoutItems()) {
      const el = this._elementForItem(it);
      if (el && targets.has(el) && it.width > 0 && it.height > 0) out.push(it);
    }
    return out;
  }

  isVisible(selector) { return this._nodeBoxes(selector).length > 0; }

  _textOf(node) {
    if (!node) return "";
    if (node.nodeType === 3) return node.textContent || "";
    let s = node.textContent || "";
    if (!s && node.children) s = node.children.map((c) => this._textOf(c)).join(" ");
    return s;
  }

  textOf(selector) {
    const n = this._findAll(selector)[0];
    if (!n) return null;
    // Form fields carry their content in `value`, not textContent.
    if (n.localName === "input" || n.localName === "textarea" || n.localName === "select")
      return String(n.value ?? n.attributes?.value ?? "");
    return this._textOf(n).replace(/\s+/g, " ").trim();
  }

  assertVisible(selector) {
    const v = this.isVisible(selector);
    return { pass: v, detail: v ? `${selector} visible` : `${selector} NOT visible` };
  }

  assertHidden(selector) {
    const v = this.isVisible(selector);
    return { pass: !v, detail: v ? `${selector} unexpectedly visible` : `${selector} hidden` };
  }

  assertText(selector, sub) {
    const t = this.textOf(selector);
    const pass = t != null && t.includes(sub);
    return { pass, detail: pass ? `${selector} contains "${sub}"` : `${selector} text missing "${sub}" (got: ${(t || "").slice(0, 80)})` };
  }

  assertBg(selector, hex) {
    const bg = this.computedBg(selector);
    const pass = bg != null && normColor(bg) === normColor(hex);
    return { pass, detail: pass ? `${selector} bg ${bg}` : `${selector} bg ${bg}, expected ${hex}` };
  }

  /* ---------------- script runner ---------------- */

  _resolvePoint(arg) {
    // "x,y" viewport coords, or a selector.
    const m = String(arg).trim().match(/^(-?\d+)\s*,\s*(-?\d+)$/);
    if (m) return { x: +m[1], y: +m[2], label: `${m[1]},${m[2]}` };
    const c = this.viewportCenterOf(arg);
    if (!c) throw new Error(`no element for selector: ${arg}`);
    return { x: Math.round(c.x), y: Math.round(c.y), label: `${arg} @${Math.round(c.x)},${Math.round(c.y)}`, node: c.node };
  }

  _nodeLabel(node) {
    if (!node) return "nothing";
    const id = node.attributes?.id ? `#${node.attributes.id}` : "";
    const cls = node.attributes?.class ? `.${String(node.attributes.class).split(/\s+/)[0]}` : "";
    return `<${node.localName}${id}${cls}>`;
  }

  async runSteps(steps) {
    const report = { ok: true, failed: 0, steps: [], shots: [] };
    for (const st of steps) {
      const t0 = Date.now();
      const rec = { op: st.op, arg: st.arg, ok: true, ms: 0, detail: "" };
      try {
        rec.detail = (await this._runStep(st)) || "";
      } catch (e) {
        rec.ok = false;
        rec.detail = "ERROR: " + e.message;
      }
      rec.ms = Date.now() - t0;
      if (!rec.ok) { report.ok = false; report.failed++; }
      report.steps.push(rec);
    }
    return report;
  }

  async _runStep(st) {
    const a = st.arg || "";
    switch (st.op) {
      case "shot": {
        const p = a || `/tmp/merkava-verify-${Date.now()}-${this._shotCount}.png`;
        const r = this.savePng(p);
        return `saved ${r.path} ${r.bytes}B in ${r.ms}ms`;
      }
      case "click":
      case "tap": {
        const pt = this._resolvePoint(a);
        const node = this.click(pt.x, pt.y);
        return `clicked ${pt.label} -> ${this._nodeLabel(node)} (no page JS runs; use state: to simulate handler effects)`;
      }
      case "hover": {
        const pt = this._resolvePoint(a);
        this.hover(pt.x, pt.y);
        return `hover ${pt.label}`;
      }
      case "dblclick": {
        const pt = this._resolvePoint(a);
        this.dblclick(pt.x, pt.y);
        return `dblclick ${pt.label}`;
      }
      case "scroll": {
        const y = this.scrollBy(Number(a));
        return `scrollY=${y}`;
      }
      case "scrollto": {
        const y = this.scrollTo(Number(a));
        return `scrollY=${y}`;
      }
      case "type": {
        const i = a.indexOf(":");
        if (i < 0) throw new Error("type needs selector:text");
        const sel = a.slice(0, i), text = a.slice(i + 1);
        this.type(text, sel);
        return `typed ${text.length} chars into ${sel}`;
      }
      case "press":
        this.press(a.trim());
        return `pressed ${a.trim()}`;
      case "wait":
        await new Promise((r) => setTimeout(r, Number(a) || 0));
        return `waited ${a}ms`;
      case "state": {
        const m = a.match(/^(.+?)([+~-])([A-Za-z0-9_-]+)$/);
        if (!m) throw new Error("state needs selector:+/−/~class");
        const sel = m[1].replace(/:+$/, ""), mode = m[2], cls = m[3];
        if (mode === "+") this.addClass(sel, cls);
        else if (mode === "-") this.removeClass(sel, cls);
        else this.toggleClass(sel, cls);
        return `class ${mode}${cls} on ${sel}`;
      }
      case "hide": this.setHidden(a, true); return `hidden ${a}`;
      case "show": this.setHidden(a, false); return `shown ${a}`;
      case "attr": {
        const m = a.match(/^([^:]+):([^=]+)=(.*)$/);
        if (!m) throw new Error("attr needs selector:name=value");
        this.setAttr(m[1], m[2], m[3]);
        return `attr ${m[2]}=${m[3]} on ${m[1]}`;
      }
      case "style": {
        const m = a.match(/^([^:]+):([^=]+)=(.*)$/);
        if (!m) throw new Error("style needs selector:prop=value");
        this.setStyle(m[1], m[2], m[3]);
        return `style ${m[2]}=${m[3]} on ${m[1]}`;
      }
      case "assert": {
        const m = a.match(/^(visible|hidden):(.+)$/) || a.match(/^(text|bg):([^:]+):(.+)$/);
        if (!m) throw new Error("assert needs visible|hidden|text|bg");
        let r;
        if (m[1] === "visible") r = this.assertVisible(m[2]);
        else if (m[1] === "hidden") r = this.assertHidden(m[2]);
        else if (m[1] === "text") r = this.assertText(m[2], m[3]);
        else r = this.assertBg(m[2], m[3]);
        if (!r.pass) { const e = new Error("ASSERT FAIL: " + r.detail); e.assertFail = true; throw e; }
        return "PASS: " + r.detail;
      }
      case "viewport": {
        const m = a.match(/^(\d+)x(\d+)$/);
        if (!m) throw new Error("viewport needs WxH");
        this.setViewport(+m[1], +m[2]);
        return `viewport ${m[1]}x${m[2]}`;
      }
      case "log":
        return a;
      default:
        throw new Error(`unknown op: ${st.op}`);
    }
  }
}

/** Parse an --interact script into steps. `\;` escapes a literal semicolon. */
export function parseInteract(script) {
  const steps = [];
  const parts = String(script || "")
    .split(/(?<!\\);/)
    .map((s) => s.replace(/\\;/g, ";").trim())
    .filter(Boolean);
  for (const p of parts) {
    const i = p.indexOf(":");
    if (i < 0) steps.push({ op: p.trim(), arg: "", raw: p });
    else steps.push({ op: p.slice(0, i).trim(), arg: p.slice(i + 1).trim(), raw: p });
  }
  return steps;
}

/** Warm batch: one process, many pages. Each page: {name,html,viewport,dpr,steps,out}. */
export async function runBatch(pages, defaults = {}) {
  const results = [];
  for (const pg of pages) {
    const t0 = Date.now();
    try {
      let width = defaults.width || 1280, height = defaults.height || 800, dpr = defaults.dpr || 1;
      if (pg.viewport) {
        const m = String(pg.viewport).match(/^(\d+)x(\d+)$/);
        if (m) { width = +m[1]; height = +m[2]; }
      }
      if (pg.dpr != null) dpr = pg.dpr;
      const sess = new VerifySession(pg.html, {
        width, height, dpr,
        pngLevel: pg.pngLevel ?? defaults.pngLevel,
      });
      const steps = typeof pg.steps === "string" ? parseInteract(pg.steps) : (pg.steps || []);
      // Default: one screenshot if no steps given.
      const report = await sess.runSteps(steps.length ? steps : [{ op: "shot", arg: pg.out || "", raw: "shot" }]);
      results.push({ name: pg.name || "page", ok: report.ok, failed: report.failed, ms: Date.now() - t0, report });
    } catch (e) {
      results.push({ name: pg.name || "page", ok: false, failed: 1, ms: Date.now() - t0, error: e.message });
    }
  }
  return results;
}
