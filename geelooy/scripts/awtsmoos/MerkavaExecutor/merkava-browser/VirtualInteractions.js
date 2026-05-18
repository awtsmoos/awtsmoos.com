// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualInteractions = factory().VirtualInteractions; }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualInteractions {
        constructor(window) { this.window = window; }
        element(selector) { const el = this.window.document.querySelector(selector); if (!el) throw new Error('Missing selector: ' + selector); return el; }
        click(selector) { return this.window.mouse.click(selector); }
        type(selector, text) { const el = this.element(selector); el.focus?.(); this.window.keyboard.type(text); return el.value; }
        key(selector, key) { this.element(selector).focus?.(); return this.window.keyboard.press(key); }
        dispatch(selector, event) { return this.element(selector).dispatchEvent(event); }
        assertText(selector, expected) { const got = this.element(selector).textContent; if (!String(got).includes(String(expected))) throw new Error('Text mismatch: ' + got); return true; }
        assertExists(selector) { return !!this.element(selector); }
    }
    return { VirtualInteractions };
});
