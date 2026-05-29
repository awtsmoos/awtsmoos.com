// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeAddress.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.HTMLAssembler = factory(root.Merkava).HTMLAssembler; }
})(typeof self !== 'undefined' ? self : this, function(addressMod) {
    const RuntimeAddress = addressMod.RuntimeAddress;

    /**
     * @class HTMLAssembler
     * @description Chapter 79: HTML scripts are not all fire. The Awtsmoos
     * distinguishes executable classic/module scripts from importmaps and JSON
     * vessels, so Merkava follows browser law instead of trying to execute data.
     */
    class HTMLAssembler {
        constructor({ files = {}, graph = null, origin, base } = {}) {
            this.files = files;
            this.graph = graph;
            this.address = new RuntimeAddress({ origin, base });
        }

        assemble(entry) {
            const html = this.files[entry] || '';
            const scripts = [], styles = [], assets = [], executionPlan = [], warnings = [], importMaps = [];
            this.graph?.node?.(entry, { kind: 'html' });

            for (const { attrs, body } of scriptTags(html)) {
                const scriptType = normalizeScriptType(attrs.type);
                const inline = !attrs.src;
                const item = { kind: 'script', type: scriptType, src: attrs.src || null, inline, code: inline ? body : '', from: entry, attrs };
                if (attrs.src) item.resolved = this.address.fileKey(attrs.src, entry, this.files);
                scripts.push(item);
                if (scriptType === 'importmap') {
                    importMaps.push({ from: entry, code: body, parsed: parseImportMap(body, warnings) });
                    this.graph?.edge?.(entry, 'inline-importmap:' + importMaps.length, 'importmap');
                    continue;
                }
                if (scriptType === 'data') {
                    assets.push({ kind: 'script-data', from: entry, type: attrs.type || '', code: body });
                    continue;
                }
                executionPlan.push(item);
                this.graph?.edge?.(entry, item.resolved || 'inline-script:' + scripts.length, item.type + '-script');
            }

            for (const attrs of linkTags(html)) {
                if (String(attrs.rel || '').toLowerCase() !== 'stylesheet') continue;
                const href = this.address.fileKey(attrs.href, entry, this.files);
                styles.push({ href, specifier: attrs.href, from: entry });
                this.graph?.edge?.(entry, href, 'stylesheet');
            }

            for (const item of [...styles]) if (!this.files[item.href]) warnings.push({ kind: 'missing-asset', href: item.href, from: entry });
            return { entry, scripts, styles, assets, importMaps, executionPlan, warnings };
        }
    }

    function normalizeScriptType(type = '') {
        const clean = String(type || '').trim().toLowerCase();
        if (!clean || clean === 'text/javascript' || clean === 'application/javascript') return 'classic';
        if (clean === 'module') return 'module';
        if (clean === 'importmap') return 'importmap';
        if (clean.includes('json') || clean.includes('ld+json') || clean.includes('template')) return 'data';
        return 'data';
    }

    function parseImportMap(body = '', warnings = []) {
        try { return JSON.parse(body || '{}'); }
        catch (error) { warnings.push({ kind: 'invalid-importmap', message: error.message }); return {}; }
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
        const out = {};
        const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of raw.matchAll(re)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
        return out;
    }

    return { HTMLAssembler };
});
