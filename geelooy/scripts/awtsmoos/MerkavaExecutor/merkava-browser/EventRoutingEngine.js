// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeLog.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.EventRoutingEngine = factory(root.Merkava).EventRoutingEngine; }
})(typeof self !== 'undefined' ? self : this, function(logMod) {
  const RuntimeLog = logMod.RuntimeLog;
  class EventRoutingEngine {
    constructor(window, layoutEngine, options = {}) { this.window = window; this.document = window.document; this.layoutEngine = layoutEngine; this.log = options.log || new RuntimeLog('event'); this.hovered = null; }
    hitTest(x, y, node = this.layoutEngine.tree) {
      if (!node) return null;
      for (let i = (node.children || []).length - 1; i >= 0; i--) { const hit = this.hitTest(x, y, node.children[i]); if (hit) return hit; }
      if (node.node && typeof node.node.dispatchEvent === 'function' && x >= node.x && y >= node.y && x <= node.x + node.width && y <= node.y + node.height) return eventTarget(node.node);
      return null;
    }
    pointer(type, x, y) {
      const target = this.hitTest(x, y) || this.document.body;
      this.log.push('event', `${type} target=${describe(target)}`);
      if (type === 'pointermove') this.updateHover(target);
      const nativeType = type === 'pointerdown' ? 'mousedown' : type === 'pointerup' ? 'mouseup' : 'mousemove';
      const event = this.mouseEvent(nativeType, x, y);
      this.logPath(target);
      target.dispatchEvent(event);
      if (type === 'pointerdown') this.pressed = { target, x, y };
      if (type === 'pointerup' && this.pressed?.target === target) target.dispatchEvent(this.mouseEvent('click', x, y));
      if (type === 'pointerdown' && focusable(target)) this.focus(target);
      return { target: describe(target), defaultPrevented: event.defaultPrevented, x, y };
    }
    mouseEvent(type, x, y) { return new this.window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, screenX: x, screenY: y }); }
    mouseEvent(type, x, y) { return new this.window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, screenX: x, screenY: y }); }
    focus(target) { const before = this.document.activeElement; target.focus?.(); if (before !== this.document.activeElement) this.log.push('event', 'focus changed', { target: describe(this.document.activeElement) }); }
    keyboard(type, key) { const target = this.document.activeElement || this.document.body; const event = new this.window.KeyboardEvent(type, { bubbles: true, cancelable: true, key }); this.log.push('event', `${type} key=${key} target=${describe(target)}`); target.dispatchEvent(event); return { target: describe(target), key }; }
    updateHover(target) { if (target === this.hovered) return; if (this.hovered) this.log.push('event', 'hover leave', { target: describe(this.hovered) }); this.hovered = target; if (target) this.log.push('event', 'hover enter', { target: describe(target) }); }
    logPath(target) { const path = []; for (let n = target; n; n = n.parentNode) path.push(describe(n)); this.log.push('event', 'capture ' + path.slice().reverse().join(' -> ')); this.log.push('event', 'bubble ' + path.join(' -> ')); }
  }
  function eventTarget(node) { return node?.nodeType === 3 ? node.parentNode || node : node; }
  function eventTarget(node) { return node?.nodeType === 3 ? node.parentNode || node : node; }
  function focusable(node) { return !!node && ['input','textarea','select','button','a'].includes(node.localName) && !node.disabled; }
  function describe(node) { if (!node) return 'null'; return `${node.localName || node.tagName}${node.id ? '#' + node.id : ''}${node.className ? '.' + String(node.className).trim().replace(/\s+/g, '.') : ''}`; }
  return { EventRoutingEngine };
});
