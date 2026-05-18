// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeAddress.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.ImportResolver = factory(root.Merkava).ImportResolver; }
})(typeof self !== 'undefined' ? self : this, function(addressMod) {
    const RuntimeAddress = addressMod.RuntimeAddress;
    class ImportResolver {
        constructor({ files = {}, graph = null, origin, base } = {}) { this.files = files; this.graph = graph; this.address = new RuntimeAddress({ origin, base }); this.warnings = []; }
        importsOf(source) { return this.importsDetailed(source).map(x => x.specifier); }
        importsDetailed(source, from = '') {
            const refs = [];
            const add = (specifier, clause = '', kind = 'static') => refs.push({ specifier, clause: clause.trim(), kind, resolved: this.resolve(from, specifier), local: localName(specifier, refs.length), from });
            for (const m of source.matchAll(/\bimport\s+([^'"]*?)\s*from\s*['"]([^'"]+)['"]/g)) add(m[2], m[1], 'static');
            for (const m of source.matchAll(/\bimport\s*['"]([^'"]+)['"]/g)) add(m[1], '', 'side-effect');
            for (const m of source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) add(m[1], '', 'dynamic');
            for (const m of source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) add(m[1], '', 'require');
            return refs;
        }
        resolve(from, spec) {
            if (!spec.startsWith('.') && !spec.startsWith('/') && !/^[a-z]+:/i.test(spec)) return 'package:' + spec;
            return this.address.fileKey(spec, from || '/', this.files);
        }
        graphFrom(entry) {
            const visited = new Set(), unresolved = [];
            const walk = file => {
                if (visited.has(file)) return; visited.add(file);
                this.graph?.node?.(file, { kind: 'module' });
                for (const item of this.importsDetailed(this.files[file] || '', file)) {
                    this.graph?.edge?.(file, item.resolved, 'imports');
                    if (this.files[item.resolved]) walk(item.resolved); else unresolved.push(item);
                }
            };
            walk(entry); return { entry, modules: Array.from(visited), unresolved };
        }
    }
    function localName(spec, i) { return '__merkava_module_' + i + '_' + String(spec).replace(/\W+/g, '_'); }
    return { ImportResolver };
});
