// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeAddress = factory().RuntimeAddress; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * RuntimeAddress is the quiet cartographer of the Merkava. It receives a
     * browser-flavored specifier, follows the road through URL dust, then folds
     * well-known CDN Three paths back into real local vessels when those vessels
     * exist in the runtime file map. The Awtsmoos lets no counterfeit library be
     * born here: the path only points toward checked-in source.
     */
    class RuntimeAddress {
        constructor({ origin = 'http://127.0.0.1:8080/', base = '/' } = {}) {
            this.origin = new URL(origin).href;
            this.base = new URL(base, this.origin).href;
        }
        resolve(specifier, from = this.base) {
            const raw = String(specifier || '');
            if (!raw) return raw;
            if (/^\/\//.test(raw)) return new URL('https:' + raw).pathname;
            if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return new URL(raw).pathname;
            return new URL(raw, new URL(from, this.origin)).pathname;
        }
        fileKey(specifier, from = this.base, files = {}) {
            const resolved = this.resolve(specifier, from);
            const aliased = cdnThreeAlias(specifier) || cdnThreeAlias(resolved) || resolved;
            const tries = [aliased, aliased.replace(/^\//, ''), aliased + '.js', aliased + '/index.js'];
            return tries.find(item => Object.prototype.hasOwnProperty.call(files, item)) || aliased;
        }
    }

    function cdnThreeAlias(specifier = '') {
        const clean = String(specifier || '');
        if (/three\.js@[^/]+\/build\/three\.js$/i.test(clean)) return '/geelooy/games/scripts/build/three.module.js';
        if (/three\.js@[^/]+\/examples\/js\/controls\/OrbitControls\.js$/i.test(clean)) return '/geelooy/games/scripts/jsm/controls/OrbitControls.js';
        if (/three\.js@[^/]+\/examples\/js\/loaders\/GLTFLoader\.js$/i.test(clean)) return '/geelooy/games/scripts/jsm/loaders/GLTFLoader.js';
        if (/three\.js@[^/]+\/examples\/js\/loaders\/RGBELoader\.js$/i.test(clean)) return '/geelooy/games/scripts/jsm/loaders/RGBELoader.js';
        return null;
    }

    return { RuntimeAddress };
});
