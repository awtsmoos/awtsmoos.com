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

  function simpleMatch(node, selector) {
    const s = String(selector || '').trim();
    if (!s || node.nodeType !== 1) return false;
    const attr = s.match(/^([\w-]+)?\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
    if (attr) return (!attr[1] || node.localName === attr[1].toLowerCase()) && (attr[3] == null ? node.hasAttribute(attr[2]) : node.getAttribute(attr[2]) === attr[3]);
    const tag = s.match(/^[a-zA-Z][\w-]*/)?.[0] || '';
    const id = s.match(/#([\w-]+)/)?.[1] || '';
    const classes = [...s.matchAll(/\.([\w-]+)/g)].map(x => x[1]);
    if (tag && node.localName !== tag.toLowerCase()) return false;
    if (id && node.id !== id) return false;
    return classes.every(name => node.classList?.contains(name));
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

  /**
   * B"H
   * A living DOM node: it mutates, bubbles, captures, serializes, and reports
   * exact element handles so tests can inspect vessels instead of shadows.
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
      this.classList = new VirtualClassList(this);
    }

    get textContent() { return this.nodeType === 3 ? this._textContent : (this._textContent || this.children.map(child => child.textContent || '').join('')); }
    set textContent(value) { this._textContent = String(value ?? ''); if (this.nodeType !== 3) this.replaceChildren(); }
    get firstChild() { return this.children[0] || null; }
    get lastChild() { return this.children[this.children.length - 1] || null; }
    get parentElement() { return this.parentNode?.nodeType === 1 ? this.parentNode : null; }
    get previousSibling() { const p = this.parentNode?.children || []; return p[p.indexOf(this) - 1] || null; }
    get nextSibling() { const p = this.parentNode?.children || []; return p[p.indexOf(this) + 1] || null; }
    get firstElementChild() { return this.children.find(x => x.nodeType === 1) || null; }
    get childElementCount() { return this.children.filter(x => x.nodeType === 1).length; }

    __notify(kind, extra = {}) { this.ownerDocument?.__notifyMutation?.({ kind, target: this.__handle(), ...extra }); }
    __handle() { return { nodeId: this.__nodeId, tagName: this.tagName, id: this.id, className: this.className, textContent: this.textContent, value: this.value }; }

    appendChild(child) {
      if (child.nodeType === 11) { while (child.firstChild) this.appendChild(child.firstChild); return child; }
      if (child.parentNode) child.parentNode.removeChild(child);
      child.parentNode = this;
      this.children.push(child);
      this.__notify('childList', { addedNodes: [child.__handle()], removedNodes: [] });
      return child;
    }
    insertBefore(child, before) {
      if (!before) return this.appendChild(child);
      const i = this.children.indexOf(before);
      if (i < 0) throw new Error('Reference node not found');
      if (child.parentNode) child.parentNode.removeChild(child);
      child.parentNode = this;
      this.children.splice(i, 0, child);
      this.__notify('childList', { addedNodes: [child.__handle()], removedNodes: [] });
      return child;
    }
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i < 0) throw new Error('Child not found');
      this.children.splice(i, 1);
      child.parentNode = null;
      this.__notify('childList', { addedNodes: [], removedNodes: [child.__handle()] });
      return child;
    }
    replaceChild(newChild, oldChild) { this.insertBefore(newChild, oldChild); this.removeChild(oldChild); return oldChild; }
    replaceChildren(...nodes) { while (this.firstChild) this.removeChild(this.firstChild); nodes.forEach(node => this.appendChild(node)); }
    cloneNode(deep = false) { const copy = new VirtualElement(this.localName, this.ownerDocument); for (const [k, v] of Object.entries(this.attributes)) copy.setAttribute(k, v); copy.textContent = this._textContent; if (deep) this.children.forEach(c => copy.appendChild(c.cloneNode(true))); return copy; }
    contains(node) { for (let cur = node; cur; cur = cur.parentNode) if (cur === this) return true; return false; }

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
      if (key === 'checked') this.checked = true;
      if (key === 'selected') this.selected = true;
      if (key === 'hidden') this.hidden = true;
      if (key === 'disabled') this.disabled = true;
      if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
      this.__notify('attributes', { attributeName: key, oldValue });
    }
    getAttribute(name) { return this.attributes[String(name).toLowerCase()] ?? null; }
    hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, String(name).toLowerCase()); }
    removeAttribute(name) { const key = String(name).toLowerCase(); const oldValue = this.attributes[key] ?? null; delete this.attributes[key]; if (key === 'id') this.id = ''; if (key === 'class') this.className = ''; this.__notify('attributes', { attributeName: key, oldValue }); }

    focus() { const doc = this.ownerDocument; if (!doc || doc.activeElement === this) return; const old = doc.activeElement; if (old) old.dispatchEvent(new VirtualEvent('blur')); doc.activeElement = this; this.dispatchEvent(new VirtualEvent('focus')); this.dispatchEvent(new VirtualEvent('focusin', { bubbles: true })); }
    blur() { if (this.ownerDocument?.activeElement === this) { this.dispatchEvent(new VirtualEvent('blur')); this.dispatchEvent(new VirtualEvent('focusout', { bubbles: true })); this.ownerDocument.activeElement = null; } }
    click() { if (this.disabled) return; if (this.type === 'checkbox') this.checked = !this.checked; this.dispatchEvent(new VirtualEvent('click', { bubbles: true, cancelable: true })); }
    addEventListener(type, handler, options = false) { if (handler) (this.listeners[type] = this.listeners[type] || []).push({ handler, capture: isCapture(options), once: !!options?.once }); }
    removeEventListener(type, handler, options = false) { const cap = isCapture(options); this.listeners[type] = (this.listeners[type] || []).filter(item => item.handler !== handler || item.capture !== cap); }
    __invoke(event, capture) { for (const item of (this.listeners[event.type] || []).slice()) { if (item.capture !== capture) continue; event.currentTarget = this; item.handler.call(this, event); if (item.once) this.removeEventListener(event.type, item.handler, { capture }); if (event.__immediateStopped) break; } }
    dispatchEvent(rawEvent) { const event = typeof rawEvent === 'string' ? new VirtualEvent(rawEvent) : rawEvent; if (!event.type) throw new Error('Event missing type'); event.target ||= this; const path = []; for (let n = this; n; n = n.parentNode) path.push(n); event.__path = path.slice(); for (let i = path.length - 1; i > 0 && !event.cancelBubble; i--) { event.eventPhase = 1; path[i].__invoke(event, true); } if (!event.cancelBubble) { event.eventPhase = 2; this.__invoke(event, true); if (!event.__immediateStopped) this.__invoke(event, false); } if (event.bubbles) for (let i = 1; i < path.length && !event.cancelBubble; i++) { event.eventPhase = 3; path[i].__invoke(event, false); } event.eventPhase = 0; event.currentTarget = null; return !event.defaultPrevented; }

    matches(selector) { return matchesSelector(this, selector); }
    closest(selector) { for (let cur = this; cur; cur = cur.parentNode) if (cur.matches?.(selector)) return cur; return null; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selector) { const out = []; const walk = node => { if (node.nodeType === 1 && node.matches(selector)) out.push(node); node.children.forEach(walk); }; this.children.forEach(walk); return out; }
    get innerHTML() { return html().serializeChildren(this); }
    set innerHTML(value) { html().parseInto(this, value); this.__notify('childList', { html: String(value ?? '') }); }
    get outerHTML() { return html().serialize(this); }
    getContext(kind) { const type = String(kind || '').toLowerCase(); if (this.tagName !== 'CANVAS') return null; if (type === '2d') return this.__canvas2dContext ||= new canvas2dMod.VirtualCanvas2DContext(this, this.ownerDocument?.textureArena); if (type === 'webgl' || type === 'webgl2') return this.__webglContext ||= new webglMod.VirtualWebGLContext(this, this.ownerDocument?.textureArena); return null; }
    toJSON() { return { ...this.__handle(), nodeType: this.nodeType, name: this.name, type: this.type, checked: this.checked, selected: this.selected, attributes: this.attributes, dataset: this.dataset, style: this.style.toJSON(), webgl: this.__webglContext?.snapshot?.() || null, children: this.children.map(c => c.toJSON()) }; }
  }

  return { VirtualElement };
});
