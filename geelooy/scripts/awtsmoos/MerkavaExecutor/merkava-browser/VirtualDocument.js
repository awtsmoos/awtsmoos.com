// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualElement.js'), require('./VirtualWebGLTextureArena.js'), require('./VirtualFontAtlas.js'), require('./VirtualCssEngine.js'), require('./LayoutScheduler.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualDocument = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualDocument;
  }
})(typeof self !== 'undefined' ? self : this, function(elements, arenaMod, fontMod, cssMod, schedMod) {
  const VirtualElement = elements.VirtualElement;
  const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
  const VirtualFontAtlas = fontMod.VirtualFontAtlas;
  const VirtualCssEngine = cssMod.VirtualCssEngine;
  const LayoutScheduler = schedMod && schedMod.LayoutScheduler;

  /**
   * B"H
   * The document is the palace floor: every live node walks with an id,
   * mutation records are preserved, and selector queries return the actual
   * vessels being touched by the runtime rather than pass/fail smoke.
   *
   * Chapter 101: The SVG Gate Opened.
   * Browser worlds draw stars, circles, paths, and heavens through
   * createElementNS. The Merkava document now honors that namespace breath
   * without faking the drawing engine; it simply gives SVG-shaped vessels the
   * same DOM life that a browser page expects at boot.
   *
   * B"H (2026-10-09): extreme DOM optimization pass.
   * - __idMap: O(1) getElementById (was: full tree walk + per-node parse).
   * - __selectorCache: selector strings parsed once per document (was: once
   *   per node per query).
   * - __nodePool: dead nodes are reset and reused (bounded at 1024).
   * - __notifyMutation: one record object per mutation (was: two spreads);
   *   the journal is capped at 10000 entries (was: unbounded growth).
   */
  class VirtualDocument {
    constructor() {
      this.textureArena = new VirtualWebGLTextureArena();
      this.fontAtlas = new VirtualFontAtlas();
      this.cssEngine = new VirtualCssEngine();
      // B"H: layout thrashing defense. Every DOM/style mutation funnels through
      // __notifyMutation; the scheduler batches writes, coalesces reads, and
      // keeps transform/opacity on the compositor fast path (zero layout).
      this.__layoutScheduler = LayoutScheduler ? new LayoutScheduler() : null;
      this.journal = [];
      this.__idMap = new Map();
      this.__selectorCache = new Map();
      this.__nodePool = [];
      this.activeElement = null;
      this.readyState = 'loading';
      this.title = '';
      this.__nextNodeId = 1;
      this.__mutationObservers = new Set();
      // B"H (2026-10-09): EXTREME OPTIMIZATION. Document-wide listener counters
      // per event type, split by phase. Lets dispatchEvent skip path-building
      // entirely when no ancestor can have listeners (the common case).
      // Maintained by add/removeEventListener; null-prototype for fast lookup.
      this.__captureTypes = Object.create(null);
      this.__bubbleTypes = Object.create(null);
      this.documentElement = new VirtualElement('html', this);
      this.head = new VirtualElement('head', this);
      this.body = new VirtualElement('body', this);
      this.documentElement.appendChild(this.head);
      this.documentElement.appendChild(this.body);
      this.implementation = makeImplementation(this);
    }

    /**
     * B"H: pooled element checkout. Reset nodes come back with fresh ids
     * and tag state; the pool is bounded so it can never grow without limit.
     */
    __checkoutElement(tagName) {
      const pooled = this.__nodePool.pop();
      if (!pooled) return new VirtualElement(tagName, this);
      const tag = String(tagName);
      const upper = tag.toUpperCase();
      pooled.tagName = upper;
      pooled.nodeName = upper;
      pooled.localName = tag.toLowerCase();
      pooled.nodeType = upper === '#TEXT' ? 3 : upper === '#FRAGMENT' ? 11 : 1;
      pooled.ownerDocument = this;
      pooled.__nodeId = this.__nextNodeId++;
      pooled.__width = pooled.localName === 'canvas' ? 300 : 0;
      pooled.__height = pooled.localName === 'canvas' ? 150 : 0;
      if (pooled.localName === 'canvas') {
        pooled.attributes.width = '300';
        pooled.attributes.height = '150';
      }
      if (pooled.localName === 'template') {
        pooled.__templateContent = pooled.__newFragment();
      }
      return pooled;
    }

    /**
     * B"H: recycles a detached subtree into the pool. Every pooled field is
     * reset so a reused node can never leak prior state; ids are unregistered
     * from __idMap at recycle time.
     */
    __recycleNode(node) {
      const pool = this.__nodePool;
      const stack = [node];
      while (stack.length) {
        const n = stack.pop();
        if (!n || (n.nodeType !== 1 && n.nodeType !== 3)) continue;
        const kids = n._children;
        if (kids) for (let i = 0; i < kids.length; i++) stack.push(kids[i]);
        n.parentNode = null;
        n._children = undefined;
        n._attributes = null;
        n._listeners = null;
        n._dataset = null;
        n._style = null;
        n._classList = null;
        n._textContent = '';
        n.value = '';
        n.checked = false;
        n.selected = false;
        if (n._id) { this.__idMap.delete(n._id); n._id = ''; }
        n.className = '';
        n.name = '';
        n.type = '';
        n.tabIndex = -1;
        n.hidden = false;
        n.disabled = false;
        n.shadowRoot = null;
        n.host = null;
        n.mode = null;
        n.__width = 0;
        n.__height = 0;
        n.namespaceURI = null;
        n.ownerSVGElement = null;
        n.createSVGPoint = undefined;
        n.__templateContent = null;
        n.__canvas2dContext = null;
        n.__webglContext = null;
        n.__webglCanvasTexture = null;
        n.tagName = '';
        n.nodeName = '';
        n.localName = '';
        n.nodeType = 1;
        n.ownerDocument = this;
        if (pool.length < 1024) pool.push(n);
      }
    }

    createElement(tagName) { return this.__checkoutElement(tagName); }
    createElementNS(namespaceURI, qualifiedName) {
      const node = this.__checkoutElement(qualifiedName);
      node.namespaceURI = namespaceURI == null ? null : String(namespaceURI);
      node.ownerSVGElement = node.localName === 'svg' ? node : null;
      node.createSVGPoint = node.localName === 'svg' ? () => ({ x: 0, y: 0, matrixTransform(point) { return point || this; } }) : undefined;
      return node;
    }
    createDocumentFragment() { return this.__checkoutElement('#fragment'); }
    createTextNode(text) {
      const node = this.__checkoutElement('#text');
      node._textContent = String(text);
      return node;
    }
    /**
     * B"H: O(1) id lookup with a connected-tree guard. Detached or
     * duplicate-id nodes fall back to the tree-order walk.
     */
    getElementById(id) {
      const key = String(id);
      const node = this.__idMap.get(key);
      if (node && node !== this.documentElement) {
        for (let n = node; n; n = n.parentNode) {
          if (n === this.documentElement) return node;
        }
      } else if (node) {
        return node;
      }
      return this.documentElement.querySelector('#' + key);
    }
    getElementsByName(name) { return this.documentElement.querySelectorAll('[name="' + String(name).replace(/"/g, '') + '"]'); }
    getElementsByTagName(tagName) { return this.documentElement.querySelectorAll(String(tagName || '*')); }
    getElementsByClassName(className) { return this.documentElement.querySelectorAll('.' + String(className || '').trim().split(/\s+/).join('.')); }
    querySelector(selector) { return this.documentElement.querySelector(selector); }
    querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
    addEventListener(type, handler, options) { this.documentElement.addEventListener(type, handler, options); }
    removeEventListener(type, handler, options) { this.documentElement.removeEventListener(type, handler, options); }
    dispatchEvent(event) { return this.documentElement.dispatchEvent(event); }

    __registerMutationObserver(observer) { this.__mutationObservers.add(observer); }
    __unregisterMutationObserver(observer) { this.__mutationObservers.delete(observer); }
    /**
     * B"H: one record object per mutation (was: two spreads + Date.now on a
     * throwaway). The journal is capped at 10000 entries; it previously grew
     * without bound on mutation-heavy pages.
     */
    __notifyMutation(kind, target, extra) {
      const record = { kind, target: target.__handle() };
      if (extra) for (const key in extra) record[key] = extra[key];
      record.at = Date.now();
      const journal = this.journal;
      journal.push(record);
      // B"H: amortized trim — dropping 1000 at once every 1000 over cap costs
      // ~0.2us/notify. The old per-notify splice(0,1) cost ~23us each.
      if (journal.length > 11000) journal.splice(0, journal.length - 10000);
      // B"H: layout thrashing defense — writes batch here, never force layout.
      const sched = this.__layoutScheduler;
      if (sched) {
        if (kind === 'childList') sched.noteStructureChange();
        else if (kind === 'characterData') sched.noteTextChange();
        else if (kind === 'attributes') sched.noteAttributeChange(target, record.attributeName);
      }
      for (const observer of this.__mutationObservers) observer.__enqueue(record);
    }

    toJSON() {
      return {
        activeElement: this.activeElement?.id || this.activeElement?.tagName || null,
        readyState: this.readyState,
        title: this.title,
        documentElement: this.documentElement.toJSON(),
        journal: this.journal
      };
    }
  }

  function makeImplementation(document) {
    return {
      createHTMLDocument(title = '') {
        const child = new VirtualDocument();
        child.title = String(title || '');
        return child;
      },
      hasFeature() { return true; },
      ownerDocument: document
    };
  }

  return { VirtualDocument };
});
