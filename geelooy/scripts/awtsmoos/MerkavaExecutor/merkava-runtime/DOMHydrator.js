// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.DOMHydrator = factory(); }
})(typeof self !== 'undefined' ? self : this, function() {
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','source','track','wbr']);
    const skippedTags = new Set(['link','meta','script']);
    const rawTags = new Set(['style','textarea','title']);

    /**
     * B"H
     * Chapter 47: The Fire Stayed Executable But Left No Ash In The Body.
     *
     * The Awtsmoos renews HTML as two paths: visible DOM and executable plan.
     * Classic script source belongs to the execution plan, not body text. Worker
     * and shader-like scripts are also gathered by assemblers, so hydration keeps
     * the body clean and lets the separate runtime flame decide what runs.
     *
     * @param {object} document Virtual document vessel.
     * @param {string} html Full HTML source.
     * @returns {{ ok: boolean, count: number }} Hydration verdict.
     */
    function hydrateHTML(document, html = '') {
        if (!document?.body) return { ok: false, count: 0 };
        reset(document.body);
        const body = bodyHTML(html);
        const stack = [document.body];
        let count = 0;
        let i = 0;
        while (i < body.length) {
            if (body.startsWith('<!--', i)) { i = skipComment(body, i); continue; }
            if (body[i] !== '<') {
                const next = nextTag(body, i);
                appendText(document, currentContainer(stack), body.slice(i, next));
                i = next;
                continue;
            }
            const close = body.indexOf('>', i + 1);
            if (close < 0) { appendText(document, currentContainer(stack), body.slice(i)); break; }
            const raw = body.slice(i + 1, close).trim();
            if (!raw) { i = close + 1; continue; }
            if (raw[0] === '/') { closeStack(stack, raw.slice(1).trim().toLowerCase()); i = close + 1; continue; }
            const selfClosing = raw.endsWith('/');
            const clean = selfClosing ? raw.slice(0, -1).trim() : raw;
            const space = clean.search(/\s/);
            const tag = (space < 0 ? clean : clean.slice(0, space)).toLowerCase();
            const attrText = space < 0 ? '' : clean.slice(space + 1);
            if (skippedTags.has(tag)) { i = rawTags.has(tag) || tag === 'script' ? readRaw(body, tag, close + 1).end : close + 1; continue; }
            const el = document.createElement(tag);
            for (const [name, value] of Object.entries(attrsOf(attrText))) el.setAttribute(name, value);
            currentContainer(stack).appendChild(el);
            count++;
            if (rawTags.has(tag)) {
                const got = readRaw(body, tag, close + 1);
                el.textContent = got.text;
                i = got.end;
                continue;
            }
            if (!selfClosing && !voidTags.has(tag)) stack.push(templateContainer(el));
            i = close + 1;
        }
        return { ok: true, count };
    }

    /** @param {object} node Virtual node to reset. @returns {void} */
    function reset(node) { node.children = []; node.childNodes = node.children; node._textContent = ''; }
    /** @param {string} html Source. @param {number} i Offset. @returns {number} */
    function nextTag(html, i) { const n = html.indexOf('<', i); return n < 0 ? html.length : n; }
    /** @param {string} html Source. @param {number} i Offset. @returns {number} */
    function skipComment(html, i) { const n = html.indexOf('-->', i + 4); return n < 0 ? html.length : n + 3; }
    /** @param {string} html Source. @param {string} tag Raw tag. @param {number} from Offset. @returns {{ text: string, end: number }} */
    function readRaw(html, tag, from) { const endTag = `</${tag}>`; const lower = html.toLowerCase(); const end = lower.indexOf(endTag, from); return end < 0 ? { text: html.slice(from), end: html.length } : { text: html.slice(from, end), end: end + endTag.length }; }
    /** @param {object[]} stack Open node stack. @param {string} closing Closing tag. @returns {void} */
    function closeStack(stack, closing) { for (let i = stack.length - 1; i > 0; i--) { const node = stack[i]; const host = node.host && node.host.localName === closing; if (node.localName === closing || host) { stack.length = i; return; } } }
    /** @param {object} document Virtual document. @param {object} parent Parent. @param {string} rawText Text. @returns {void} */
    function appendText(document, parent, rawText) { const text = String(rawText || '').replace(/\s+/g, ' ').trim(); if (text) parent.appendChild(document.createTextNode(text)); }
    /** @param {object[]} stack Stack. @returns {object} Current container. */
    function currentContainer(stack) { return stack[stack.length - 1]; }
    /** @param {object} el Element. @returns {object} Container. */
    function templateContainer(el) { return el.localName === 'template' && el.content ? el.content : el; }
    /** @param {string} html Source. @returns {string} Body inner HTML. */
    function bodyHTML(html) { const m = String(html).match(/<body[^>]*>([\s\S]*?)<\/body>/i); return m ? m[1] : String(html); }
    /** @param {string} raw Attribute source. @returns {Record<string,string>} Attributes. */
    function attrsOf(raw) { const out = {}; const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g; for (const m of String(raw || '').matchAll(re)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? ''); return out; }
    /** @param {string} text Entity text. @returns {string} Decoded text. */
    function decode(text) { return String(text || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }

    return { hydrateHTML };
});
