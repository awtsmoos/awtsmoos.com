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

            for (const { attrs, body } of scriptTags(html)) {
                const inline = !attrs.src;
                const item = { kind: 'script', type: attrs.type === 'module' ? 'module' : 'classic', src: attrs.src || null, inline, code: inline ? body : '', from: entry };
                if (attrs.src) item.resolved = this.address.fileKey(attrs.src, entry, this.files);
                scripts.push(item); executionPlan.push(item);
                this.graph?.edge?.(entry, item.resolved || 'inline-script:' + scripts.length, item.type + '-script');
            }

            for (const attrs of linkTags(html)) {
                if (String(attrs.rel || '').toLowerCase() !== 'stylesheet') continue;
                const href = this.address.fileKey(attrs.href, entry, this.files);
                styles.push({ href, specifier: attrs.href, from: entry });
                this.graph?.edge?.(entry, href, 'stylesheet');
            }

            for (const item of [...styles, ...assets]) if (!this.files[item.href]) warnings.push({ kind: 'missing-asset', href: item.href, from: entry });
            return { entry, scripts, styles, assets, executionPlan, warnings };
        }
    }
    function scriptTags(html) {
        const out = [];
        const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
        for (const m of String(html).matchAll(re)) out.push({ attrs: attrsOf(m[1] || ''), body: m[2] || '' });
        return out;
    }
    function linkTags(html) {
        const out = [];
        const re = /<link\b([^>]*)\/?\s*>/gi;
        for (const m of String(html).matchAll(re)) out.push(attrsOf(m[1] || ''));
        return out;
    }
    function attrsOf(raw) {
        const out = {}; const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of raw.matchAll(re)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
        return out;
    }
    return { HTMLAssembler };
});
