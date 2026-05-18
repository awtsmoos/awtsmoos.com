// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualStorage = factory().VirtualStorage; }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualStorage {
        constructor() { this.map = new Map(); }
        get length() { return this.map.size; }
        key(index) { return Array.from(this.map.keys())[index] || null; }
        getItem(key) { key = String(key); return this.map.has(key) ? this.map.get(key) : null; }
        setItem(key, value) { this.map.set(String(key), String(value)); }
        removeItem(key) { this.map.delete(String(key)); }
        clear() { this.map.clear(); }
        toJSON() { return Object.fromEntries(this.map.entries()); }
    }
    return { VirtualStorage };
});
