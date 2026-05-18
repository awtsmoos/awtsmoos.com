// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeAddress.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.HTMLAssembler = factory(root.Merkava).HTMLAssembler; }
})(typeof self !== 'undefined' ? self : this, function(addressMod) {
    const RuntimeAddress = addressMod.RuntimeAddress;
    class HTMLAssembler {
        constructor({ files = {}, graph = null, origin, base } = {}) {
            this.files = files; this.graph = graph; this.address = new RuntimeAddress({ origin, base });
        }
        assemble(entry) {
            const html = this.files[entry] || '';
            const scripts = [], styles = [], assets = [], executionPlan = [], warnings = [];
            this.graph?.node?.(entry, { kind: 'html' });
            eachTag(html, (tag, attrs, body) => {
                if (tag === 'script') {
                    const inline = !attrs.src;
                    const item = { kind: 'script', type: attrs.type === 'module' ? 'module' : 'classic', src: attrs.src || null, inline, code: inline ? body : '', from: entry };
                    if (attrs.src) item.resolved = this.address.fileKey(attrs.src, entry, this.files);
                    scripts.push(item); executionPlan.push(item);
                    this.graph?.edge?.(entry, item.resolved || 'inline-script:' + scripts.length, item.type + '-script');
                }
                if (tag === 'link' && String(attrs.rel || '').toLowerCase() === 'stylesheet') {
                    const href = this.address.fileKey(attrs.href, entry, this.files);
                    styles.push({ href, specifier: attrs.href, from: entry });
                    this.graph?.edge?.(entry, href, 'stylesheet');
                }
                for (const name of ['src','href']) if (attrs[name] && tag !== 'script' && tag !== 'link') {
                    const href = this.address.fileKey(attrs[name], entry, this.files);
                    assets.push({ tag, attr: name, href, specifier: attrs[name], from: entry });
                    this.graph?.edge?.(entry, href, 'html-asset');
                }
            });
            for (const item of [...styles, ...assets]) if (!this.files[item.href]) warnings.push({ kind: 'missing-asset', href: item.href, from: entry });
            return { entry, scripts, styles, assets, executionPlan, warnings };
        }
    }
    function eachTag(html, visit) {
        const re = /<([a-z][\w:-]*)([^>]*)>([\s\S]*?)<\/\1>|<([a-z][\w:-]*)([^>]*)\/?>/gi;
        for (const m of html.matchAll(re)) visit(String(m[1] || m[4]).toLowerCase(), attrsOf(m[2] || m[5] || ''), m[3] || '');
    }
    function attrsOf(raw) {
        const out = {}; const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of raw.matchAll(re)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
        return out;
    }
    return { HTMLAssembler };
});
