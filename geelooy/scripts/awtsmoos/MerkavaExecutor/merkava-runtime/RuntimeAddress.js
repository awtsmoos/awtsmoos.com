// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeAddress = factory().RuntimeAddress; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * RuntimeAddress is the quiet cartographer of the Merkava: it does not know
     * your repo, your server, or your geelooy. It only receives a base URL and
     * resolves specifiers the way a browser-like reality would reveal them.
     */
    class RuntimeAddress {
        constructor({ origin = 'http://127.0.0.1:8080/', base = '/' } = {}) {
            this.origin = new URL(origin).href;
            this.base = new URL(base, this.origin).href;
        }
        resolve(specifier, from = this.base) {
            const raw = String(specifier || '');
            if (!raw) return raw;
            if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
            if (!raw.startsWith('.') && !raw.startsWith('/')) return raw;
            return new URL(raw, new URL(from, this.origin)).pathname;
        }
        fileKey(specifier, from = this.base, files = {}) {
            const resolved = this.resolve(specifier, from);
            const tries = [resolved, resolved.replace(/^\//, ''), resolved + '.js', resolved + '/index.js'];
            return tries.find(path => Object.prototype.hasOwnProperty.call(files, path)) || resolved;
        }
    }
    return { RuntimeAddress };
});
