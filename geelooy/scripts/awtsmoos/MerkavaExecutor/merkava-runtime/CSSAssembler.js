// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeAddress.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.CSSAssembler = factory(root.Merkava).CSSAssembler; }
})(typeof self !== 'undefined' ? self : this, function(addressMod) {
    const RuntimeAddress = addressMod.RuntimeAddress;
    class CSSAssembler {
        constructor({ files = {}, graph = null, origin, base } = {}) { this.files = files; this.graph = graph; this.address = new RuntimeAddress({ origin, base }); }
        assemble(entry) {
            const visited = new Set(), imports = [], assets = [], ordered = [], warnings = [];
            const walk = file => {
                if (visited.has(file)) return; visited.add(file); this.graph?.node?.(file, { kind: 'css' });
                const css = this.files[file] || ''; if (!this.files[file]) warnings.push({ kind: 'missing-css', file });
                for (const ref of extractImports(css)) { const next = this.address.fileKey(ref, file, this.files); imports.push({ from: file, to: next, specifier: ref }); this.graph?.edge?.(file, next, 'css-import'); if (this.files[next]) walk(next); else warnings.push({ kind: 'missing-css-import', from: file, to: next }); }
                for (const ref of extractUrls(css)) { const next = this.address.fileKey(ref, file, this.files); assets.push({ from: file, to: next, specifier: ref }); this.graph?.edge?.(file, next, 'css-asset'); this.graph?.node?.(next, { kind: 'asset' }); if (!this.files[next]) warnings.push({ kind: 'missing-css-asset', from: file, to: next }); }
                ordered.push(file);
            };
            walk(entry); return { entry, ordered, imports, assets, warnings };
        }
    }
    function extractImports(css) { const refs = []; for (const m of css.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?/g)) refs.push(m[1]); return refs; }
    function extractUrls(css) { const refs = []; for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) if (!m[1].startsWith('data:')) refs.push(m[1]); return refs; }
    return { CSSAssembler };
});
