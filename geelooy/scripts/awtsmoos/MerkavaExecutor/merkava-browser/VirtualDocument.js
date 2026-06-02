// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualElement.js'), require('./VirtualWebGLTextureArena.js'), require('./VirtualFontAtlas.js'), require('./VirtualCssEngine.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualDocument = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualDocument;
  }
})(typeof self !== 'undefined' ? self : this, function(elements, arenaMod, fontMod, cssMod) {
  const VirtualElement = elements.VirtualElement;
  const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
  const VirtualFontAtlas = fontMod.VirtualFontAtlas;
  const VirtualCssEngine = cssMod.VirtualCssEngine;

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
   */
  class VirtualDocument {
    constructor() {
      this.textureArena = new VirtualWebGLTextureArena();
      this.fontAtlas = new VirtualFontAtlas();
      this.cssEngine = new VirtualCssEngine();
      this.journal = [];
      this.activeElement = null;
      this.readyState = 'loading';
      this.title = '';
      this.__nextNodeId = 1;
      this.__mutationObservers = new Set();
      this.documentElement = new VirtualElement('html', this);
      this.head = new VirtualElement('head', this);
      this.body = new VirtualElement('body', this);
      this.documentElement.appendChild(this.head);
      this.documentElement.appendChild(this.body);
      this.implementation = makeImplementation(this);
    }

    createElement(tagName) { return new VirtualElement(tagName, this); }
    createElementNS(namespaceURI, qualifiedName) {
      const node = new VirtualElement(qualifiedName, this);
      node.namespaceURI = namespaceURI == null ? null : String(namespaceURI);
      node.ownerSVGElement = node.localName === 'svg' ? node : null;
      node.createSVGPoint = node.localName === 'svg' ? () => ({ x: 0, y: 0, matrixTransform(point) { return point || this; } }) : undefined;
      return node;
    }
    createDocumentFragment() { return new VirtualElement('#fragment', this); }
    createTextNode(text) { const node = new VirtualElement('#text', this); node.textContent = String(text); return node; }
    getElementById(id) { return this.documentElement.querySelector('#' + id); }
    getElementsByName(name) { return this.documentElement.querySelectorAll('[name=\"' + String(name).replace(/\"/g, '') + '\"]'); }
    getElementsByTagName(tagName) { return this.documentElement.querySelectorAll(String(tagName || '*')); }
    getElementsByClassName(className) { return this.documentElement.querySelectorAll('.' + String(className || '').trim().split(/\s+/).join('.')); }
    querySelector(selector) { return this.documentElement.querySelector(selector); }
    querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
    addEventListener(type, handler, options) { this.documentElement.addEventListener(type, handler, options); }
    removeEventListener(type, handler, options) { this.documentElement.removeEventListener(type, handler, options); }
    dispatchEvent(event) { return this.documentElement.dispatchEvent(event); }

    __registerMutationObserver(observer) { this.__mutationObservers.add(observer); }
    __unregisterMutationObserver(observer) { this.__mutationObservers.delete(observer); }
    __notifyMutation(record) {
      const enriched = { ...record, at: Date.now() };
      this.journal.push(enriched);
      for (const observer of this.__mutationObservers) observer.__enqueue(enriched);
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
