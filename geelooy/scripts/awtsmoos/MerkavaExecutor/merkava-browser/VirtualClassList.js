// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualClassList = factory().VirtualClassList; }
})(typeof self !== 'undefined' ? self : this, function() {
    /** Chapter 13: The Awtsmoos gathers class names like sparks into vessels. */
    class VirtualClassList {
        constructor(element) { this.element = element; }
        values() { return String(this.element.className || '').split(/\s+/).filter(Boolean); }
        write(values) { this.element.className = Array.from(new Set(values)).join(' '); this.element.attributes.class = this.element.className; }
        add(...names) { this.write(this.values().concat(names.filter(Boolean).map(String))); }
        remove(...names) { const dead = new Set(names.map(String)); this.write(this.values().filter(name => !dead.has(name))); }
        contains(name) { return this.values().includes(String(name)); }
        toggle(name, force) { const has = this.contains(name); if (force === true || (!has && force !== false)) { this.add(name); return true; } if (has) this.remove(name); return false; }
        toString() { return this.element.className || ''; }
        [Symbol.iterator]() { return this.values()[Symbol.iterator](); }
    }
    return { VirtualClassList };
});
