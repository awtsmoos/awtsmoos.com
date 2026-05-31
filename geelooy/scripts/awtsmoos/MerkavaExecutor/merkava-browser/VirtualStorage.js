// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualStorage = factory().VirtualStorage; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * Chapter 21: The storage vessel learned Chrome's second language.
     * `setItem()` writes still flow through the map, but property reads like
     * `localStorage.foo` now reveal the same spark. The Awtsmoos binds method
     * calls safely so destructuring and direct invocation do not tear the vessel.
     */
    class VirtualStorage {
        constructor() {
            this.map = new Map();
            return new Proxy(this, {
                get(target, prop, receiver) {
                    if (prop in target) {
                        const value = Reflect.get(target, prop, receiver);
                        return typeof value === 'function' ? value.bind(target) : value;
                    }
                    if (typeof prop === 'string') return target.getItem(prop);
                    return undefined;
                },
                set(target, prop, value) {
                    if (typeof prop === 'string' && !(prop in target)) {
                        target.setItem(prop, value);
                        return true;
                    }
                    return Reflect.set(target, prop, value);
                },
                deleteProperty(target, prop) {
                    if (typeof prop === 'string') {
                        target.removeItem(prop);
                        return true;
                    }
                    return false;
                },
                has(target, prop) {
                    return prop in target || (typeof prop === 'string' && target.map.has(prop));
                },
                ownKeys(target) {
                    return [...new Set([...Reflect.ownKeys(target), ...target.map.keys()])];
                },
                getOwnPropertyDescriptor(target, prop) {
                    if (typeof prop === 'string' && target.map.has(prop)) {
                        return { enumerable: true, configurable: true, value: target.getItem(prop) };
                    }
                    return Reflect.getOwnPropertyDescriptor(target, prop);
                }
            });
        }

        get length() { return this.map.size; }
        key(index) { return Array.from(this.map.keys())[Number(index)] || null; }
        getItem(key) { key = String(key); return this.map.has(key) ? this.map.get(key) : null; }
        setItem(key, value) { this.map.set(String(key), String(value)); }
        removeItem(key) { this.map.delete(String(key)); }
        clear() { this.map.clear(); }
        toJSON() { return Object.fromEntries(this.map.entries()); }
    }
    return { VirtualStorage };
});
