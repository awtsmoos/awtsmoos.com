// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualEvents.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualMouse = factory(root.Merkava).VirtualMouse; }
})(typeof self !== 'undefined' ? self : this, function(events) {
    const MouseEvent = events.VirtualMouseEvent || events.MouseEvent;
    class VirtualMouse {
        constructor(window) { this.window = window; this.x = 0; this.y = 0; this.buttons = 0; this.target = null; this.history = []; }
        move(x, y, target = null) { this.x = x; this.y = y; this.target = target || this.target; return this.fire('mousemove'); }
        moveTo(selector) { const el = this.window.document.querySelector(selector); if (!el) throw new Error('No element for mouse: ' + selector); this.target = el; return this.move(0, 0, el); }
        down() { this.buttons = 1; return this.fire('mousedown'); }
        up() { this.buttons = 0; return this.fire('mouseup'); }
        click(selector) { if (selector) this.moveTo(selector); this.down(); this.up(); return this.fire('click'); }
        fire(type) { const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: this.x, clientY: this.y }); this.history.push({ type, x: this.x, y: this.y, at: Date.now() }); this.target?.dispatchEvent?.(ev); return ev; }
        toJSON() { return { x: this.x, y: this.y, buttons: this.buttons, history: this.history }; }
    }
    return { VirtualMouse };
});
