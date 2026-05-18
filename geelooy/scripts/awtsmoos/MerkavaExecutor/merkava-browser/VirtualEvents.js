// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory()); }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualEvent {
        constructor(type, init = {}) { this.type = type; this.bubbles = !!init.bubbles; this.cancelable = !!init.cancelable; this.defaultPrevented = false; Object.assign(this, init); }
        preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
    }
    class VirtualCustomEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.detail = init.detail; } }
    class VirtualKeyboardEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.key = init.key || ''; this.code = init.code || this.key; } }
    class VirtualMouseEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.clientX = init.clientX || 0; this.clientY = init.clientY || 0; this.button = init.button || 0; } }
    class VirtualInputEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.data = init.data || ''; this.inputType = init.inputType || 'insertText'; } }
    return { VirtualEvent, VirtualCustomEvent, VirtualKeyboardEvent, VirtualMouseEvent, VirtualInputEvent };
});
