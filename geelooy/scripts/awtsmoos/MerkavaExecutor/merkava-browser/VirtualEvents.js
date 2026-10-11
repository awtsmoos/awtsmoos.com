// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory()); }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualEvent {
        constructor(type, init) {
            // B"H (2026-10-09): EXTREME OPTIMIZATION. Fixed-order field prefix
            // for V8 hidden-class stability. __immediateStopped/__path are
            // pre-initialized (were added dynamically mid-dispatch before,
            // causing a hidden-class transition on every dispatch).
            this.type = type;
            this.bubbles = false;
            this.cancelable = false;
            this.composed = false;
            this.defaultPrevented = false;
            this.cancelBubble = false;
            this.__immediateStopped = false;
            this.eventPhase = 0;
            this.target = null;
            this.currentTarget = null;
            this.timeStamp = Date.now();
            this.__path = null;
            if (init !== undefined && init !== null) {
                this.bubbles = !!init.bubbles;
                this.cancelable = !!init.cancelable;
                this.composed = !!init.composed;
                this.target = init.target || null;
                Object.assign(this, init);
            }
        }
        preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
        stopPropagation() { this.cancelBubble = true; }
        stopImmediatePropagation() { this.cancelBubble = true; this.__immediateStopped = true; }
        composedPath() {
            if (this.__path) return this.__path.slice();
            const path = [];
            for (let n = this.target; n; n = n.parentNode || n.host) path.push(n);
            return path;
        }
    }
    class VirtualCustomEvent extends VirtualEvent { constructor(type, init) { super(type, init); this.detail = init ? init.detail : undefined; } }
    class VirtualKeyboardEvent extends VirtualEvent { constructor(type, init) { super(type, init); this.key = init && init.key || ''; this.code = init && init.code || this.key; this.ctrlKey = !!(init && init.ctrlKey); this.shiftKey = !!(init && init.shiftKey); this.altKey = !!(init && init.altKey); this.metaKey = !!(init && init.metaKey); } }
    class VirtualMouseEvent extends VirtualEvent { constructor(type, init) { super(type, init); this.clientX = init && init.clientX || 0; this.clientY = init && init.clientY || 0; this.button = init && init.button || 0; this.buttons = init && init.buttons || 0; } }
    class VirtualInputEvent extends VirtualEvent { constructor(type, init) { super(type, init); this.data = init && init.data || ''; this.inputType = init && init.inputType || 'insertText'; } }
    return { VirtualEvent, VirtualCustomEvent, VirtualKeyboardEvent, VirtualMouseEvent, VirtualInputEvent };
});
