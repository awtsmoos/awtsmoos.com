// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.DOMHydrator = factory(); }
})(typeof self !== 'undefined' ? self : this, function() {
    function hydrateHTML(document, html = '') {
        if (!document?.body) return { ok: false, count: 0 };
        document.body.children = [];
        document.body.textContent = '';
        const body = bodyHTML(html);
        const stack = [document.body];
        let count = 0;
        let ignoredTag = null;
        const re = /<\/(\w[\w:-]*)>|<(\w[\w:-]*)([^>]*)>|([^<]+)/g;
        for (const m of body.matchAll(re)) {
            const closing = m[1] ? m[1].toLowerCase() : '';
            const opening = m[2] ? m[2].toLowerCase() : '';

            if (ignoredTag) {
                if (closing === ignoredTag) ignoredTag = null;
                continue;
            }

            if (closing) { if (stack.length > 1) stack.pop(); continue; }
            if (opening) {
                const tag = opening;
                if (tag === 'script' || tag === 'style') { ignoredTag = tag; continue; }
                if (tag === 'link' || tag === 'meta') continue;
                const el = document.createElement(tag);
                for (const [name, value] of Object.entries(attrsOf(m[3] || ''))) el.setAttribute(name, value);
                stack[stack.length - 1].appendChild(el); count++;
                if (!/\/$/.test(m[0]) && !voidTags.has(tag)) stack.push(el);
                continue;
            }
            const text = String(m[4] || '').replace(/\s+/g, ' ').trim();
            if (text && stack.length) stack[stack.length - 1].textContent += text;
        }
        return { ok: true, count };
    }
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','source','track','wbr']);
    function bodyHTML(html) {
        const m = String(html).match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return m ? m[1] : String(html);
    }
    function attrsOf(raw) {
        const out = {}; const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of raw.matchAll(re)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
        return out;
    }
    return { hydrateHTML };
});
