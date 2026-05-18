// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualElement = factory().VirtualElement; }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualElement {
        constructor(tagName = 'div', ownerDocument = null) {
            this.tagName = String(tagName).toUpperCase(); this.nodeName = this.tagName; this.ownerDocument = ownerDocument;
            this.children = []; this.parentNode = null; this.attributes = {}; this.style = {}; this.listeners = {};
            this.dataset = {};
            this.textContent = ''; this.value = ''; this.id = ''; this.className = '';
        }
        appendChild(child) { child.parentNode = this; this.children.push(child); this.ownerDocument?.journal?.push({ kind: 'appendChild', parent: this.tagName, child: child.tagName, at: Date.now() }); return child; }
        removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }
        setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'id') this.id = String(value); if (name === 'class') this.className = String(value); if (name === 'value') this.value = String(value); if (String(name).startsWith('data-')) this.dataset[String(name).slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value); }
        getAttribute(name) { return this.attributes[name] ?? null; }
        focus() { if (this.ownerDocument) this.ownerDocument.activeElement = this; this.dispatchEvent({ type: 'focus' }); }
        click() { this.dispatchEvent({ type: 'click', bubbles: true, cancelable: true }); }
        addEventListener(type, handler) { this.listeners[type] = this.listeners[type] || []; this.listeners[type].push(handler); }
        dispatchEvent(event) { event.target = event.target || this; for (const handler of this.listeners[event.type] || []) handler.call(this, event); if (event.bubbles && this.parentNode) this.parentNode.dispatchEvent(event); return !event.defaultPrevented; }
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
        querySelectorAll(selector) {
            const out = [], matches = node => selector.startsWith('#') ? node.id === selector.slice(1) : selector.startsWith('.') ? String(node.className).split(/\s+/).includes(selector.slice(1)) : node.tagName.toLowerCase() === selector.toLowerCase();
            const walk = node => { if (matches(node)) out.push(node); node.children.forEach(walk); };
            this.children.forEach(walk); return out;
        }
        toJSON() { return { tagName: this.tagName, id: this.id, className: this.className, value: this.value, textContent: this.textContent, attributes: this.attributes, children: this.children.map(c => c.toJSON()) }; }
    }
    return { VirtualElement };
});
