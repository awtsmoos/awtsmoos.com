// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualEvents.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualKeyboard = factory(root.Merkava).VirtualKeyboard; }
})(typeof self !== 'undefined' ? self : this, function(events) {
    const KeyboardEvent = events.VirtualKeyboardEvent || events.KeyboardEvent;
    const InputEvent = events.VirtualInputEvent || events.InputEvent;
    class VirtualKeyboard {
        constructor(window) { this.window = window; this.pressed = new Set(); this.history = []; }
        press(key) { this.down(key); this.up(key); }
        down(key) { this.pressed.add(key); this.fire('keydown', key); if (key.length === 1) this.input(key); }
        up(key) { this.pressed.delete(key); this.fire('keyup', key); }
        type(text) { for (const ch of String(text)) this.press(ch); }
        input(ch) { const el = this.window.document.activeElement; if (el) el.value = String(el.value || '') + ch; el?.dispatchEvent?.(new InputEvent('input', { bubbles: true, data: ch })); }
        fire(type, key) { const ev = new KeyboardEvent(type, { bubbles: true, cancelable: true, key }); this.history.push({ type, key, at: Date.now() }); this.window.document.activeElement?.dispatchEvent?.(ev); return ev; }
        toJSON() { return { pressed: Array.from(this.pressed), history: this.history }; }
    }
    return { VirtualKeyboard };
});
