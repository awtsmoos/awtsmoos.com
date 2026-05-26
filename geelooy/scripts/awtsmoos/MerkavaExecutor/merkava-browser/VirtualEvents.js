// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory()); }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualEvent {
        constructor(type, init = {}) {
            this.type = type; this.bubbles = !!init.bubbles; this.cancelable = !!init.cancelable;
            this.composed = !!init.composed; this.defaultPrevented = false; this.cancelBubble = false;
            this.eventPhase = 0; this.target = init.target || null; this.currentTarget = null; this.timeStamp = Date.now();
            Object.assign(this, init);
        }
        preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
        stopPropagation() { this.cancelBubble = true; }
        stopImmediatePropagation() { this.cancelBubble = true; this.__immediateStopped = true; }
        composedPath() { return this.__path ? this.__path.slice() : []; }
    }
    class VirtualCustomEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.detail = init.detail; } }
    class VirtualKeyboardEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.key = init.key || ''; this.code = init.code || this.key; this.ctrlKey = !!init.ctrlKey; this.shiftKey = !!init.shiftKey; this.altKey = !!init.altKey; this.metaKey = !!init.metaKey; } }
    class VirtualMouseEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.clientX = init.clientX || 0; this.clientY = init.clientY || 0; this.button = init.button || 0; this.buttons = init.buttons || 0; } }
    class VirtualInputEvent extends VirtualEvent { constructor(type, init = {}) { super(type, init); this.data = init.data || ''; this.inputType = init.inputType || 'insertText'; } }
    return { VirtualEvent, VirtualCustomEvent, VirtualKeyboardEvent, VirtualMouseEvent, VirtualInputEvent };
});
