// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualStyleDeclaration = factory().VirtualStyleDeclaration; }
})(typeof self !== 'undefined' ? self : this, function() {
    /** Chapter 14: The Awtsmoos pours color into names and names into form. */
    const dash = name => String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    const camel = name => String(name).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    class VirtualStyleDeclaration {
        constructor() { this.props = Object.create(null); }
        setProperty(name, value) { this.props[dash(name)] = String(value); this[camel(name)] = String(value); }
        getPropertyValue(name) { return this.props[dash(name)] || ''; }
        removeProperty(name) { const key = dash(name), old = this.props[key] || ''; delete this.props[key]; delete this[camel(name)]; return old; }
        assignText(text) { for (const part of String(text || '').split(';')) { const at = part.indexOf(':'); if (at > -1) this.setProperty(part.slice(0, at).trim(), part.slice(at + 1).trim()); } }
        toString() { return Object.entries(this.props).map(([k, v]) => `${k}: ${v};`).join(' '); }
        toJSON() { return { ...this.props }; }
    }
    return { VirtualStyleDeclaration };
});
