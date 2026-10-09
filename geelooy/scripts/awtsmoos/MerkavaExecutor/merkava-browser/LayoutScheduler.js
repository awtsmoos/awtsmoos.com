// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.LayoutScheduler = factory().LayoutScheduler; }
})(typeof self !== 'undefined' ? self : this, function() {
  /**
   * B"H — LayoutScheduler: kills forced synchronous layout (layout thrashing).
   *
   * Chrome's #1 web perf killer is read-after-write: script writes style,
   * reads offsetWidth, forces a sync reflow, repeats. This scheduler brings
   * the same discipline to the Merkava engine:
   *
   *  1. WRITE BATCHING — style/class/attribute/DOM writes only mark state
   *     dirty; they never run layout. N writes between frames cost 1 layout.
   *  2. READ BATCHING — geometry reads (offsetWidth, getBoundingClientRect,
   *     ...) bracket with beginRead/endRead. A whole batch of reads after
   *     writes flushes exactly ONE layout, not one per read.
   *  3. DIRTY TRACKING — frame() calls layoutIfNeeded(): clean frames reuse
   *     the retained tree with ZERO layout work.
   *  4. COMPOSITOR FAST PATH — transform/opacity (and friends) never dirty
   *     layout at all. A transform animation runs 0 layouts; the compositor
   *     applies the visual change directly.
   *
   * Property classification:
   *  - compositor-only: transform, translate, rotate, scale, opacity,
   *    transform-origin — visual only, zero layout, zero repaint of the tree.
   *  - paint-only: color, backgrounds, shadows, visibility, z-index, ... —
   *    needs repaint, never layout.
   *  - layout: everything else.
   */
  const COMPOSITOR_ONLY = new Set([
    'transform', 'translate', 'rotate', 'scale', 'opacity',
    'transform-origin', 'perspective', 'perspective-origin', 'backface-visibility'
  ]);
  const PAINT_ONLY = new Set([
    'color', 'background', 'background-color', 'background-image',
    'border-color', 'outline', 'outline-color', 'box-shadow', 'text-shadow',
    'visibility', 'z-index', 'cursor', 'pointer-events', 'fill', 'stroke',
    'filter', 'mix-blend-mode', 'clip-path'
  ]);
  // Attributes whose change can affect geometry or selector matching.
  const LAYOUT_ATTRS = new Set([
    'class', 'id', 'style', 'width', 'height', 'hidden', 'value',
    'placeholder', 'type', 'size', 'cols', 'rows'
  ]);

  class LayoutScheduler {
    constructor() {
      this.enabled = true;          // false = baseline mode for A/B benchmarks
      this.layoutDirty = true;      // first layout must always run
      this.engine = null;           // attached layout engine (RetainedLayoutEngine)
      this.viewportFn = null;
      this.lastViewport = null;
      this.readDepth = 0;
      this.pendingReadFlush = false;
      this.compositorDirty = new Set(); // nodes with compositor-only changes
      this.paintDirty = new Set();      // nodes with paint-only changes
      this.stats = {
        forcedSyncLayouts: 0,  // full layout passes actually run
        skippedLayouts: 0,    // frame()/read calls that reused the retained tree
        batchedReads: 0,       // read batches coalesced into one layout
        compositorOnlyWrites: 0,
        paintOnlyWrites: 0,
        layoutWrites: 0
      };
    }

    /** Attaches the layout engine used for flushes. viewportFn returns {width,height}. */
    attachEngine(engine, viewportFn) {
      this.engine = engine || this.engine;
      if (viewportFn) this.viewportFn = viewportFn;
    }

    // ---- write side: batching (never runs layout) ----

    /** Classifies one inline-style write. Returns 'layout'|'paint'|'compositor'. */
    noteStyleChange(node, propName) {
      const prop = String(propName || '').toLowerCase();
      if (!this.enabled) return 'layout';
      if (COMPOSITOR_ONLY.has(prop)) {
        if (node) this.compositorDirty.add(node);
        this.stats.compositorOnlyWrites++;
        return 'compositor';
      }
      if (PAINT_ONLY.has(prop)) {
        if (node) this.paintDirty.add(node);
        this.stats.paintOnlyWrites++;
        return 'paint';
      }
      this.layoutDirty = true;
      this.stats.layoutWrites++;
      return 'layout';
    }

    /** Class attribute / classList changes: selectors may match layout props. */
    noteClassChange(/* node */) {
      this.layoutDirty = true;
      this.stats.layoutWrites++;
    }

    /** id changes: selectors may match layout props. */
    noteIdChange(/* node */) {
      this.layoutDirty = true;
      this.stats.layoutWrites++;
    }

    /** Generic attribute write. 'style' is handled per-property by assignText. */
    noteAttributeChange(node, name) {
      const key = String(name || '').toLowerCase();
      if (key === 'style') return; // per-property classification already ran
      if (!this.enabled) { this.layoutDirty = true; return; }
      if (LAYOUT_ATTRS.has(key) || key.startsWith('data-')) {
        this.layoutDirty = true;
        this.stats.layoutWrites++;
      } else {
        if (node) this.paintDirty.add(node);
        this.stats.paintOnlyWrites++;
      }
    }

    /** Appends/removes/moves nodes, innerHTML, textContent structure edits. */
    noteStructureChange() {
      this.layoutDirty = true;
      this.stats.layoutWrites++;
    }

    /** Text edits: affect intrinsic widths and line breaking. */
    noteTextChange() {
      this.layoutDirty = true;
      this.stats.layoutWrites++;
    }

    // ---- read side: batching ----

    /**
     * Opens a geometry-read section. If layout is dirty, arms a single
     * deferred flush shared by the whole batch (nested reads coalesce).
     */
    beginRead() {
      if (!this.enabled) return;
      this.readDepth++;
      if (this.readDepth === 1 && this.layoutDirty && this.engine) {
        this.pendingReadFlush = true;
      }
    }

    /** Closes a geometry-read section; flushes once per outermost batch. */
    endRead() {
      if (!this.enabled || this.readDepth === 0) return;
      this.readDepth--;
      if (this.readDepth === 0 && this.pendingReadFlush) {
        this.pendingReadFlush = false;
        this.stats.batchedReads++;
        this.forceLayout();
      }
    }

    // ---- frame side ----

    needsLayout() { return this.layoutDirty; }

    /**
     * The frame entry: returns the retained layout tree, running a full
     * layout only when dirty or the viewport changed. Clean frames cost ~0.
     */
    layoutIfNeeded(viewport) {
      if (!this.enabled || !this.engine) {
        // Baseline / unattached: behave like the old world (always lay out).
        if (this.engine) { this.stats.forcedSyncLayouts++; return this.engine.layout(viewport || this.currentViewport()); }
        return null;
      }
      const vp = viewport || this.currentViewport();
      if (!this.layoutDirty && !this.viewportChanged(vp)) {
        this.stats.skippedLayouts++;
        return this.engine.tree;
      }
      return this.forceLayout(vp);
    }

    /** Unconditional layout — the only place a sync layout may originate. */
    forceLayout(viewport) {
      if (!this.engine) return null;
      const vp = viewport || this.currentViewport();
      const tree = this.engine.layout(vp);
      this.lastViewport = { width: vp.width, height: vp.height };
      this.layoutDirty = false;
      this.stats.forcedSyncLayouts++;
      return tree;
    }

    /** Compositor fast path: drain nodes with transform/opacity-only changes. */
    consumeCompositorDirty() {
      const out = Array.from(this.compositorDirty);
      this.compositorDirty.clear();
      return out;
    }

    /** Paint-only changes (repaint without layout). */
    consumePaintDirty() {
      const out = Array.from(this.paintDirty);
      this.paintDirty.clear();
      return out;
    }

    currentViewport() {
      if (this.viewportFn) { try { return this.viewportFn(); } catch (_) {} }
      return this.lastViewport || { width: 760, height: 600 };
    }

    viewportChanged(vp) {
      const last = this.lastViewport;
      return !last || last.width !== vp.width || last.height !== vp.height;
    }

    resetStats() {
      for (const key of Object.keys(this.stats)) this.stats[key] = 0;
      this.compositorDirty.clear();
      this.paintDirty.clear();
    }

    summary() { return { ...this.stats, layoutDirty: this.layoutDirty }; }
  }

  return { LayoutScheduler, COMPOSITOR_ONLY, PAINT_ONLY };
});
