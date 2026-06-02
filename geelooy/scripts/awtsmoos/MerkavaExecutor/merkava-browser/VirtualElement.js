// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualStyleDeclaration.js'), require('./VirtualClassList.js'), require('./VirtualEvents.js'), require('./VirtualHtmlSerializer.js'), require('./VirtualCanvas2DContext.js'), require('./VirtualWebGLContext.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualElement = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualElement;
  }
})(typeof self !== 'undefined' ? self : this, function(styleMod, classMod, eventMod, htmlMod, canvas2dMod, webglMod) {
  const VirtualStyleDeclaration = styleMod.VirtualStyleDeclaration;
  const VirtualClassList = classMod.VirtualClassList;
  const VirtualEvent = eventMod.VirtualEvent;
  const html = () => new htmlMod.VirtualHtmlSerializer();
  const isCapture = options => options === true || !!options?.capture;

  /**
   * Chapter 38: The canvas vessel received real measures.
   *
   * The Awtsmoos does not let a canvas be widthless anymore. Attributes,
   * properties, and texture records now agree, so the renderer can place 2D and
   * WebGL surfaces with their true dimensions instead of zero-sized ghosts.
   */
  class VirtualElement {
    constructor(tagName = 'div', ownerDocument = null) {
      this.tagName = String(tagName).toUpperCase();
      this.nodeName = this.tagName;
      this.localName = String(tagName).toLowerCase();
      this.nodeType = this.tagName === '#TEXT' ? 3 : this.tagName === '#FRAGMENT' ? 11 : 1;
      this.ownerDocument = ownerDocument;
      this.__nodeId = ownerDocument ? ownerDocument.__nextNodeId++ : 0;
      this.parentNode = null;
      this.children = [];
      this.childNodes = this.children;
      this.attributes = {};
      this.listeners = {};
      this.style = new VirtualStyleDeclaration();
      this.dataset = {};
      this._textContent = '';
      this.value = '';
      this.checked = false;
      this.selected = false;
      this.id = '';
      this.className = '';
      this.name = '';
      this.type = '';
      this.tabIndex = -1;
      this.hidden = false;
      this.disabled = false;
      this.shadowRoot = null;
      this.host = null;
      this.mode = null;
      this.__width = this.localName === 'canvas' ? 300 : 0;
      this.__height = this.localName === 'canvas' ? 150 : 0;
      if (this.localName === 'canvas') { this.attributes.width = '300'; this.attributes.height = '150'; }
      this.classList = new VirtualClassList(this);
      if (this.localName === 'template') this.__templateContent = this.__newFragment();
    }

    get width() { return this.__width || 0; }
    set width(value) { this.__width = positiveInt(value, 0); this.attributes.width = String(this.__width); this.__syncCanvasTextureSize(); }
    get height() { return this.__height || 0; }
    set height(value) { this.__height = positiveInt(value, 0); this.attributes.height = String(this.__height); this.__syncCanvasTextureSize(); }
    get textContent() { return this.nodeType === 3 ? this._textContent : (this._textContent || this.children.map(child => child.textContent || '').join('')); }
    set textContent(value) { this._textContent = String(value ?? ''); if (this.nodeType !== 3) this.replaceChildren(); }
    get innerText() { return this.textContent; }
    set innerText(value) { this.textContent = value; }
    get content() { if (this.localName !== 'template') return undefined; return this.__templateContent || (this.__templateContent = this.__newFragment()); }
    get firstChild() { return this.children[0] || null; }
    get lastChild() { return this.children[this.children.length - 1] || null; }
    get parentElement() { return this.parentNode?.nodeType === 1 ? this.parentNode : null; }
    get previousSibling() { const p = this.parentNode?.children || []; return p[p.indexOf(this) - 1] || null; }
    get nextSibling() { const p = this.parentNode?.children || []; return p[p.indexOf(this) + 1] || null; }
    get firstElementChild() { return this.children.find(x => x.nodeType === 1) || null; }
    get childElementCount() { return this.children.filter(x => x.nodeType === 1).length; }

    __newFragment() { const f = new VirtualElement('#fragment', this.ownerDocument); f.host = this; return f; }
    __notify(kind, extra = {}) { this.ownerDocument?.__notifyMutation?.({ kind, target: this.__handle(), ...extra }); }
    __handle() { return nodeHandle(this); }
    __coerceNode(node) { return node && typeof node === 'object' && node.nodeType ? node : this.ownerDocument.createTextNode(String(node ?? '')); }
    __syncCanvasTextureSize() { if (this.__webglCanvasTexture) { this.__webglCanvasTexture.width = this.width; this.__webglCanvasTexture.height = this.height; } }

    attachShadow(options = {}) {
      if (this.shadowRoot) throw new Error('Shadow root already attached');
      const root = this.__newFragment();
      root.mode = options.mode || 'open';
      root.host = this;
      this.shadowRoot = root;
      this.__notify('shadowRoot', { mode: root.mode });
      return root;
    }

    appendChild(child) {
      if (child.nodeType === 11) { while (child.firstChild) this.appendChild(child.firstChild); return child; }
      if (child.parentNode) child.parentNode.removeChild(child);
      child.parentNode = this;
      this.children.push(child);
      this.childNodes = this.children;
      this.__notify('childList', { addedNodes: [nodeHandle(child)], removedNodes: [] });
      return child;
    }
    append(...nodes) { for (const node of nodes) this.appendChild(this.__coerceNode(node)); }
    prepend(...nodes) { for (const node of nodes.reverse()) this.insertBefore(this.__coerceNode(node), this.firstChild); }
    before(...nodes) { if (!this.parentNode) return; for (const node of nodes) this.parentNode.insertBefore(this.__coerceNode(node), this); }
    after(...nodes) { if (!this.parentNode) return; let ref = this.nextSibling; for (const node of nodes) this.parentNode.insertBefore(this.__coerceNode(node), ref); }
    insertBefore(child, before) {
      if (!before) return this.appendChild(child);
      const i = this.children.indexOf(before);
      if (i < 0) throw new Error('Reference node not found');
      if (child.parentNode) child.parentNode.removeChild(child);
      child.parentNode = this;
      this.children.splice(i, 0, child);
      this.childNodes = this.children;
      this.__notify('childList', { addedNodes: [nodeHandle(child)], removedNodes: [] });
      return child;
    }
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i < 0) throw new Error('Child not found');
      this.children.splice(i, 1);
      this.childNodes = this.children;
      child.parentNode = null;
      this.__notify('childList', { addedNodes: [], removedNodes: [nodeHandle(child)] });
      return child;
    }
    replaceChild(newChild, oldChild) { this.insertBefore(newChild, oldChild); this.removeChild(oldChild); return oldChild; }
    replaceChildren(...nodes) { while (this.firstChild) this.removeChild(this.firstChild); nodes.forEach(node => this.appendChild(this.__coerceNode(node))); }
    cloneNode(deep = false) {
      const copy = new VirtualElement(this.localName, this.ownerDocument);
      for (const [k, v] of Object.entries(this.attributes)) copy.setAttribute(k, v);
      copy._textContent = this._textContent;
      copy.value = this.value;
      copy.checked = this.checked;
      copy.selected = this.selected;
      copy.width = this.width;
      copy.height = this.height;
      if (deep) this.children.forEach(c => copy.appendChild(c.cloneNode(true)));
      if (deep && this.localName === 'template') this.content.children.forEach(c => copy.content.appendChild(c.cloneNode(true)));
      return copy;
    }
    contains(node) { for (let cur = node; cur; cur = cur.parentNode) if (cur === this) return true; return false; }
    getRootNode() { let cur = this; while (cur.parentNode || cur.host) cur = cur.parentNode || cur.host; return cur.ownerDocument || cur; }

    setAttribute(name, value) {
      const key = String(name).toLowerCase(), oldValue = this.attributes[key] ?? null;
      this.attributes[key] = String(value);
      if (key === 'id') this.id = String(value);
      if (key === 'class') this.className = String(value);
      if (key === 'style') this.style.assignText(value);
      if (key === 'value') this.value = String(value);
      if (key === 'name') this.name = String(value);
      if (key === 'type') this.type = String(value);
      if (key === 'tabindex') this.tabIndex = Number(value);
      if (key === 'width') this.width = value;
      if (key === 'height') this.height = value;
      if (key === 'checked') this.checked = true;
      if (key === 'selected') this.selected = true;
      if (key === 'hidden') this.hidden = true;
      if (key === 'disabled') this.disabled = true;
      if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
      this.__notify('attributes', { attributeName: key, oldValue });
    }
    getAttribute(name) { return this.attributes[String(name).toLowerCase()] ?? null; }
    hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, String(name).toLowerCase()); }
    removeAttribute(name) {
      const key = String(name).toLowerCase();
      const oldValue = this.attributes[key] ?? null;
      delete this.attributes[key];
      if (key === 'id') this.id = '';
      if (key === 'class') this.className = '';
      if (key === 'width' && this.localName === 'canvas') this.width = 300;
      if (key === 'height' && this.localName === 'canvas') this.height = 150;
      this.__notify('attributes', { attributeName: key, oldValue });
    }

    focus() { const doc = this.ownerDocument; if (!doc || doc.activeElement === this) return; const old = doc.activeElement; if (old) old.dispatchEvent(new VirtualEvent('blur')); doc.activeElement = this; this.dispatchEvent(new VirtualEvent('focus')); this.dispatchEvent(new VirtualEvent('focusin', { bubbles: true })); }
    blur() { if (this.ownerDocument?.activeElement === this) { this.dispatchEvent(new VirtualEvent('blur')); this.dispatchEvent(new VirtualEvent('focusout', { bubbles: true })); this.ownerDocument.activeElement = null; } }
    click() { if (this.disabled) return; if (this.type === 'checkbox') this.checked = !this.checked; this.dispatchEvent(new VirtualEvent('click', { bubbles: true, cancelable: true })); }
    addEventListener(type, handler, options = false) { if (handler) (this.listeners[type] = this.listeners[type] || []).push({ handler, capture: isCapture(options), once: !!options?.once }); }
    removeEventListener(type, handler, options = false) { const cap = isCapture(options); this.listeners[type] = (this.listeners[type] || []).filter(item => item.handler !== handler || item.capture !== cap); }
    __invoke(event, capture) {
      for (const item of (this.listeners[event.type] || []).slice()) {
        if (item.capture !== capture) continue;
        event.currentTarget = this;
        try {
          const maybePromise = item.handler.call(this, event);
          if (maybePromise && typeof maybePromise.catch === 'function') maybePromise.catch(error => this.__captureEventError(error, event));
        } catch (error) { this.__captureEventError(error, event); }
        if (item.once) this.removeEventListener(event.type, item.handler, { capture });
        if (event.__immediateStopped) break;
      }
    }
    __captureEventError(error, event) {
      const win = this.ownerDocument?.defaultView;
      const row = { message: error?.message || String(error), stack: error?.stack || '', phase: 'event', type: event?.type || '', target: this.__handle() };
      if (win) { win.__AWTSMOOS_CAPTURED_ERRORS__ = win.__AWTSMOOS_CAPTURED_ERRORS__ || []; win.__AWTSMOOS_CAPTURED_ERRORS__.push(row); }
    }
    dispatchEvent(rawEvent) {
      const event = typeof rawEvent === 'string' ? new VirtualEvent(rawEvent) : rawEvent;
      if (!event.type) throw new Error('Event missing type');
      event.target ||= this;
      const path = [];
      for (let n = this; n; n = n.parentNode || n.host) path.push(n);
      event.__path = path.slice();
      for (let i = path.length - 1; i > 0 && !event.cancelBubble; i--) { event.eventPhase = 1; path[i].__invoke?.(event, true); }
      if (!event.cancelBubble) { event.eventPhase = 2; this.__invoke(event, true); if (!event.__immediateStopped) this.__invoke(event, false); }
      if (event.bubbles) for (let i = 1; i < path.length && !event.cancelBubble; i++) { event.eventPhase = 3; path[i].__invoke?.(event, false); }
      event.eventPhase = 0;
      event.currentTarget = null;
      return !event.defaultPrevented;
    }

    matches(selector) { return matchesSelector(this, selector); }
    closest(selector) { for (let cur = this; cur; cur = cur.parentNode || cur.host) if (cur.matches?.(selector)) return cur; return null; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selector) {
      const out = [];
      const walk = node => {
        if (node.nodeType === 1 && node.matches(selector)) out.push(node);
        (node.children || []).forEach(walk);
        if (node.shadowRoot) walk(node.shadowRoot);
      };
      (this.children || []).forEach(walk);
      return out;
    }
    get innerHTML() { return html().serializeChildren(this); }
    set innerHTML(value) { html().parseInto(this, value); this.__notify('childList', { html: String(value ?? '') }); }
    get outerHTML() { return html().serialize(this); }
    getContext(kind) {
      const type = String(kind || '').toLowerCase();
      if (this.tagName !== 'CANVAS') return null;
      this.__syncCanvasTextureSize();
      if (type === '2d') return this.__canvas2dContext ||= new canvas2dMod.VirtualCanvas2DContext(this, this.ownerDocument?.textureArena);
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return this.__webglContext ||= new webglMod.VirtualWebGLContext(this, this.ownerDocument?.textureArena);
      return null;
    }
    toJSON() {
      return { ...this.__handle(), nodeType: this.nodeType, name: this.name, type: this.type, checked: this.checked, selected: this.selected, width: this.width, height: this.height, attributes: this.attributes, dataset: this.dataset, style: this.style.toJSON(), webgl: this.__webglContext?.snapshot?.() || null, shadowRoot: this.shadowRoot?.toJSON?.() || null, children: this.children.map(childSnapshot) };
    }
  }

  function simpleMatch(node, selector) {
    const s = String(selector || '').trim();
    if (!s || node.nodeType !== 1) return false;
    const attr = s.match(/^([\w-]+)?\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
    if (attr) {
      const name = attr[2].toLowerCase();
      const reflected = reflectedAttributeValue(node, name);
      const has = node.hasAttribute(name) || reflected != null;
      const value = node.getAttribute(name) ?? reflected;
      return (!attr[1] || node.localName === attr[1].toLowerCase()) && (attr[3] == null ? has : String(value) === attr[3]);
    }
    const tag = s.match(/^[a-zA-Z][\w-]*/)?.[0] || '';
    const id = s.match(/#([\w-]+)/)?.[1] || '';
    const classes = [...s.matchAll(/\.([\w-]+)/g)].map(x => x[1]);
    if (tag && node.localName !== tag.toLowerCase()) return false;
    if (id && node.id !== id) return false;
    return classes.every(name => node.classList?.contains(name));
  }
  function reflectedAttributeValue(node, name) {
    if (name === 'id') return node.id || null;
    if (name === 'class') return node.className || null;
    if (name === 'type') return node.type || null;
    if (name === 'name') return node.name || null;
    if (name === 'value') return node.value || null;
    if (name === 'width') return node.width || null;
    if (name === 'height') return node.height || null;
    return null;
  }
  function matchesSelector(node, selector) {
    return String(selector || '').split(',').some(part => {
      const chain = part.trim().split(/\s+/).filter(Boolean);
      if (!chain.length) return false;
      if (!simpleMatch(node, chain[chain.length - 1])) return false;
      let cur = node.parentNode;
      for (let i = chain.length - 2; i >= 0; i -= 1) {
        while (cur && !simpleMatch(cur, chain[i])) cur = cur.parentNode;
        if (!cur) return false;
        cur = cur.parentNode;
      }
      return true;
    });
  }
  function nodeHandle(node) { return { nodeId: node?.__nodeId || null, tagName: node?.tagName || node?.nodeName || node?.constructor?.name || 'FOREIGN', id: node?.id || '', className: node?.className || '', textContent: node?.textContent || '', value: node?.value || '', width: node?.width || 0, height: node?.height || 0 }; }
  function childSnapshot(child) { return child && typeof child.toJSON === 'function' ? child.toJSON() : { nodeType: child?.nodeType || 1, tagName: child?.tagName || child?.nodeName || child?.constructor?.name || 'FOREIGN', id: child?.id || '', className: child?.className || '', textContent: child?.textContent || '' }; }
  function positiveInt(value, fallback) { const n = Math.floor(Number(value)); return Number.isFinite(n) && n >= 0 ? n : fallback; }
  return { VirtualElement };
});
