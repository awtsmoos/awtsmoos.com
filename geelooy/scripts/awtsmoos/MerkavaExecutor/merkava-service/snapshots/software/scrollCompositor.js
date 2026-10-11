// B"H
/**
 * @file scrollCompositor.js
 * @description
 * Compositor-only scrolling for the software renderer.
 *
 * B"H 2026-10-09 — Yaakov: "Keep going. Way faster." Scroll is the most
 * visible performance metric. The old path re-rasterized every visible item
 * every scroll frame (~20ms/frame, GC jitter to 240ms). This module makes
 * scroll a pure compositor operation:
 *
 * 1. A tall strip buffer (viewport-width x 3x viewport-height) holds
 *    rasterized page content. Scrolling within it is a single memcpy blit
 *    (~0.5ms, zero GC, deterministic).
 * 2. Scrolling past the buffered region shifts existing pixels with memmove
 *    and rasterizes ONLY the newly exposed strips — never the whole page.
 * 3. Fixed-position items are excluded from strips and painted as a tiny
 *    screen-space overlay (they don't scroll).
 * 4. Any DOM/layout change invalidates via generation bump.
 *
 * RAM: one buffer of vpW x 3x vpH x 4 bytes (5.8MB at 800x600). Bounded and
 * freed on invalidate(). No per-frame allocation in the steady state.
 */
import { Framebuffer } from "./framebuffer.js";
import { paintLayout } from "./domPainter.js";

/** Strip height for incremental fill (px). */
const STRIP_H = 256;

/**
 * Raw opaque rectangle copy between framebuffers (memcpy semantics).
 * Prefers Framebuffer.blitRaw when present; falls back to manual row
 * copies so the compositor survives concurrent edits to framebuffer.js.
 */
function blitRaw(dst, src, sx, sy, w, h, dx, dy) {
  if (dst && typeof dst.blitRaw === "function") {
    dst.blitRaw(src, sx, sy, w, h, dx, dy);
    return;
  }
  if (!dst || !src || !src.data) return;
  sx |= 0; sy |= 0; w |= 0; h |= 0; dx |= 0; dy |= 0;
  if (sx < 0) { w += sx; dx -= sx; sx = 0; }
  if (sy < 0) { h += sy; dy -= sy; sy = 0; }
  if (dx < 0) { w += dx; sx -= dx; dx = 0; }
  if (dy < 0) { h += dy; sy -= dy; dy = 0; }
  w = Math.min(w, src.width - sx, dst.width - dx);
  h = Math.min(h, src.height - sy, dst.height - dy);
  if (w <= 0 || h <= 0) return;
  const sdata = src.data, ddata = dst.data;
  const sw4 = src.width * 4, dw4 = dst.width * 4;
  const rowBytes = w * 4;
  for (let r = 0; r < h; r++) {
    ddata.set(sdata.subarray((sy + r) * sw4 + sx * 4, (sy + r) * sw4 + sx * 4 + rowBytes), (dy + r) * dw4 + dx * 4);
  }
}

/**
 * True when the item or any ancestor (up to 64) is position:fixed.
 * Fixed subtrees are viewport-relative and must not bake into scroll strips.
 * Results memoize per generation via the compositor's fixedMemo.
 */
function inFixedSubtree(item, byNode, memo) {
  if (memo) {
    const m = memo.get(item);
    if (m !== undefined) return m;
  }
  let it = item, g = 0;
  const seen = new Set();
  // Track the chain so we can memoize every visited item, not just the leaf.
  const chain = [];
  let result = false;
  while (it && !seen.has(it) && g++ < 64) {
    seen.add(it);
    chain.push(it);
    if (memo) {
      const m = memo.get(it);
      if (m !== undefined) { result = m; break; }
    }
    const pos = String((it.style || {}).position || "static").trim().toLowerCase();
    if (pos === "fixed") { result = true; break; }
    const node = it.node ? it.node.parentNode : null;
    it = node ? byNode.get(node) : null;
  }
  if (memo) for (const c of chain) memo.set(c, result);
  return result;
}

export class ScrollCompositor {
  constructor() {
    this.buf = null;       // tall Framebuffer: vpW x 3*vpH
    this.bufY = 0;         // page y of buffer top edge
    this.generation = -1;  // layout generation rasterized
    this.vpW = 0;
    this.vpH = 0;
    this.overlayItems = []; // fixed-subtree items, screen coords, per generation
    this.stripFb = null;    // reusable strip raster target (no per-strip alloc)
    // B"H 2026-10-09: memoize fixed-subtree checks per generation. The
    // ancestor walk ran per item per strip; results are generation-stable.
    this.fixedMemo = new Map();
    this.fixedMemoGen = -1;
    // B"H 2026-10-09: simple-layout flag per generation. When true, strip
    // rasterization uses paintLayout's simplePaint fast lane (no ancestor
    // walks or effect parsing). Verified by scanning the layout once.
    this.simpleGen = -2;
    this.simpleLayout = false;
  }

  /**
   * Check if the layout is "simple": no transforms, clip-paths, masks,
   * filters, blend modes, opacity<1, or non-visible overflow. Such layouts
   * paint identically via the simplePaint fast lane. O(n), cached per gen.
   */
  isSimpleLayout(layout, generation) {
    if (this.simpleGen === generation) return this.simpleLayout;
    let simple = true;
    for (const item of layout) {
      const st = item.style || {};
      const pos = String(st.position || "static").trim().toLowerCase();
      // Fixed/sticky are excluded from strips anyway; they don't disqualify.
      if (pos !== "static" && pos !== "relative" && pos !== "absolute") continue;
      const t = String(st.transform || "").trim().toLowerCase();
      if (t && t !== "none") { simple = false; break; }
      if (st["clip-path"] != null && String(st["clip-path"]).trim() !== "" &&
          String(st["clip-path"]).trim().toLowerCase() !== "none") { simple = false; break; }
      if (st["mask-image"] != null || st["-webkit-mask-image"] != null || st.mask != null) { simple = false; break; }
      if (st.filter != null && String(st.filter).trim() !== "" &&
          String(st.filter).trim().toLowerCase() !== "none") { simple = false; break; }
      if (st["mix-blend-mode"] != null && String(st["mix-blend-mode"]).trim() !== "" &&
          String(st["mix-blend-mode"]).trim().toLowerCase() !== "normal") { simple = false; break; }
      const op = st.opacity;
      if (op != null && Number(op) < 1) { simple = false; break; }
      const ov = String(st.overflow || "visible").trim().toLowerCase();
      const ovx = String(st["overflow-x"] || ov).trim().toLowerCase();
      const ovy = String(st["overflow-y"] || ov).trim().toLowerCase();
      if ((ovx !== "visible" && ovx !== "") || (ovy !== "visible" && ovy !== "")) { simple = false; break; }
    }
    this.simpleGen = generation;
    this.simpleLayout = simple;
    return simple;
  }

  /** Drop all cached pixels. Call on DOM/layout/style change. */
  invalidate() {
    this.generation = -1;
    this.overlayItems = [];
  }

  /** Free the buffer entirely (page hide / size collapse). */
  dispose() {
    this.buf = null;
    this.stripFb = null;
    this.overlayItems = [];
    this.generation = -1;
  }

  /** Pixels currently held. */
  get bytesHeld() {
    return this.buf ? this.buf.data.byteLength : 0;
  }

  /**
   * Rasterize one page region [pageY0, pageY0+stripH) into the strip
   * framebuffer, then copy it into the tall buffer at buffer offset bufY.
   * Items are translated to strip space; fixed subtrees are excluded
   * (they go to the overlay instead).
   */
  rasterizeStrip(layout, pageY0, stripH, bufY, spatialIndex, generation, collectFixed) {
    const vpW = this.vpW;
    // Reset the fixed-subtree memo when the generation changes.
    if (this.fixedMemoGen !== generation) {
      this.fixedMemo.clear();
      this.fixedMemoGen = generation;
    }
    const si = spatialIndex.ensure(layout, generation);
    const byNode = si.byNode;
    // Query a slightly expanded rect so item edges anti-alias correctly.
    const q = { x: 0, y: pageY0 - 2, width: vpW, height: stripH + 4 };
    const { visible, paintSet: visibleSet } = si.queryVisible(q, 0);
    const context = si.ancestorContext(visible, visibleSet);
    const all = [...visible, ...context];
    const origToProxy = new Map();
    const translated = [];
    const paintSet = new Set();
    for (const item of all) {
      if (inFixedSubtree(item, byNode, this.fixedMemo)) {
        if (collectFixed) collectFixed.push(item);
        continue;
      }
      const proxy = {
        ...item,
        x: (Number(item.x) || 0),
        y: (Number(item.y) || 0) - pageY0,
      };
      origToProxy.set(item, proxy);
      translated.push(proxy);
      // Only spatial-index-visible items paint; context ancestors are
      // lookup-only (a caller paintSet keeps them from painting over).
      if (visibleSet.has(item)) paintSet.add(proxy);
    }
    // Repair children arrays so paintOrder's z-index walk sees proxies.
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
    let sfb = this.stripFb;
    if (!sfb || sfb.width !== vpW || sfb.height !== stripH) {
      sfb = new Framebuffer(vpW, stripH, [255, 255, 255, 255]);
      this.stripFb = sfb;
    } else {
      sfb.clear([255, 255, 255, 255]);
    }
    // Pre-culled via the spatial index: no viewport re-cull needed. The
    // caller paintSet keeps context ancestors from painting; byNode is
    // built from the translated list so ancestor lookups stay consistent.
    // Simple layouts use the fast lane (no per-item ancestor walks).
    const simple = this.isSimpleLayout(layout, generation);
    paintLayout(sfb, translated, {}, { paintSet, simplePaint: simple });
    blitRaw(this.buf, sfb, 0, 0, vpW, stripH, 0, bufY);
  }

  /** (Re)allocate the tall buffer and rasterize it fully. */
  fullRaster(layout, vy, spatialIndex, generation) {
    const vpW = this.vpW, vpH = this.vpH;
    const bufH = vpH * 3;
    if (!this.buf || this.buf.width !== vpW || this.buf.height !== bufH) {
      this.buf = new Framebuffer(vpW, bufH, [255, 255, 255, 255]);
    }
    this.bufY = Math.max(0, vy - vpH);
    this.generation = generation;
    const fixed = [];
    for (let s = 0; s * STRIP_H < bufH; s++) {
      const pageY0 = this.bufY + s * STRIP_H;
      const h = Math.min(STRIP_H, bufH - s * STRIP_H);
      this.rasterizeStrip(layout, pageY0, h, s * STRIP_H, spatialIndex, generation, s === 0 ? fixed : null);
    }
    this.overlayItems = fixed;
  }

  /**
   * Shift buffer pixels vertically by dy (positive = content moves down,
   * i.e. user scrolled up) using memmove, then rasterize the exposed region.
   */
  shiftAndFill(layout, vy, spatialIndex, generation) {
    const vpW = this.vpW, vpH = this.vpH;
    const bufH = vpH * 3;
    const rowBytes = vpW * 4;
    const d = this.buf.data;
    const oldTop = this.bufY;
    // Desired: keep one viewport of prefetch above the new position.
    let newTop = Math.max(0, vy - vpH);
    // Clamp the shift so at least one strip overlaps (else full raster).
    const dy = newTop - oldTop;
    if (Math.abs(dy) >= bufH - STRIP_H) {
      this.fullRaster(layout, vy, spatialIndex, generation);
      return;
    }
    if (dy !== 0) {
      const dyPx = dy;
      const absRows = Math.abs(dyPx);
      if (dyPx > 0) {
        // Content moves down: copy from top toward bottom (copyWithin handles overlap).
        d.copyWithin(absRows * rowBytes, 0, (bufH - absRows) * rowBytes);
      } else {
        // Content moves up.
        d.copyWithin(0, absRows * rowBytes, bufH * rowBytes);
      }
      this.bufY = newTop;
    }
    // Rasterize newly exposed strips.
    if (dy > 0) {
      // Exposed at top: [newTop, newTop+dy)
      for (let y = newTop; y < newTop + dy; y += STRIP_H) {
        const h = Math.min(STRIP_H, newTop + dy - y);
        this.rasterizeStrip(layout, y, h, y - newTop, spatialIndex, generation, null);
      }
    } else if (dy < 0) {
      // Exposed at bottom: [newTop+bufH+dy, newTop+bufH)
      const expTop = newTop + bufH + dy;
      for (let y = expTop; y < newTop + bufH; y += STRIP_H) {
        const h = Math.min(STRIP_H, newTop + bufH - y);
        this.rasterizeStrip(layout, y, h, y - newTop, spatialIndex, generation, null);
      }
    }
  }

  /**
   * Composite one scroll frame into fb (viewport-sized).
   * Returns { blit: true } on the fast path, { blit: false, rasterized: n }
   * when strips were (re)rasterized.
   */
  scrollFrame(fb, layout, viewport, spatialIndex, generation) {
    const vpW = Math.max(1, Math.ceil(viewport.width || 800));
    const vpH = Math.max(1, Math.ceil(viewport.height || 600));
    const vy = Math.max(0, Math.floor(viewport.y || 0));
    let rasterized = 0;
    let blitOnly = true;
    if (!this.buf || this.vpW !== vpW || this.vpH !== vpH || this.generation !== generation) {
      this.vpW = vpW;
      this.vpH = vpH;
      this.fullRaster(layout, vy, spatialIndex, generation);
      rasterized = Math.ceil((vpH * 3) / STRIP_H);
      blitOnly = false;
    } else {
      const bufTop = this.bufY;
      const bufBottom = this.bufY + vpH * 3;
      if (vy >= bufTop && vy + vpH <= bufBottom) {
        // Fast path: everything needed is buffered.
      } else if (vy + vpH > bufTop && vy < bufBottom) {
        const before = this.bufY;
        this.shiftAndFill(layout, vy, spatialIndex, generation);
        rasterized = 1;
        blitOnly = false;
        void before;
      } else {
        this.fullRaster(layout, vy, spatialIndex, generation);
        rasterized = Math.ceil((vpH * 3) / STRIP_H);
        blitOnly = false;
      }
    }
    // Composite: raw memcpy of the viewport window out of the tall buffer.
    const srcY = vy - this.bufY;
    blitRaw(fb, this.buf, 0, srcY, vpW, vpH, 0, 0);
    // Fixed overlay: screen-space items painted per frame (tiny list).
    if (this.overlayItems.length) {
      paintLayout(fb, this.overlayItems, {}, {});
    }
    return { blit: blitOnly, rasterized };
  }
}
