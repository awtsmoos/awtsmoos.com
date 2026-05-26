// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualHtmlHydrator = factory().VirtualHtmlHydrator; }
})(typeof self !== 'undefined' ? self : this, function() {
    const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
    const rawTextTags = new Set(['script', 'style', 'textarea', 'title']);
    const decode = text => String(text || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const attrRe = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

    /**
     * Chapter 28: The letters of HTML descend into vessels.
     *
     * This hydrator is deliberately executor-owned. It turns HTML text into
     * VirtualDocument nodes inside MerkavaExecutor. The native host receives
     * only the later render command stream; C never decides what a tag means.
     */
    class VirtualHtmlHydrator {
        hydrate(document, source, options = {}) {
            document.head.replaceChildren();
            document.body.replaceChildren();
            const root = document.documentElement;
            const stack = [root];
            const html = stripDoctype(String(source || ''));
            let i = 0;
            while (i < html.length) {
                if (html.startsWith('<!--', i)) { i = skipComment(html, i); continue; }
                if (html[i] !== '<') { appendText(document, stack[stack.length - 1], html.slice(i, nextTag(html, i))); i = nextTag(html, i); continue; }
                const close = html.indexOf('>', i + 1);
                if (close < 0) { appendText(document, stack[stack.length - 1], html.slice(i)); break; }
                const raw = html.slice(i + 1, close).trim();
                if (!raw) { i = close + 1; continue; }
                if (raw[0] === '/') { closeElement(stack, raw.slice(1).trim().toLowerCase()); i = close + 1; continue; }
                const selfClosing = raw.endsWith('/');
                const body = selfClosing ? raw.slice(0, -1).trim() : raw;
                const space = body.search(/\s/);
                const tag = (space < 0 ? body : body.slice(0, space)).toLowerCase();
                const attrText = space < 0 ? '' : body.slice(space + 1);
                const el = canonicalElement(document, tag) || document.createElement(tag);
                readAttrs(el, attrText);
                const parent = chooseParent(document, stack, tag);
                if (!canonicalElement(document, tag)) parent.appendChild(el);
                if (tag === 'style') document.cssEngine.parseStyleSheet(readRaw(html, tag, close + 1).text);
                if (rawTextTags.has(tag)) {
                    const rawValue = readRaw(html, tag, close + 1);
                    if (rawValue.text) el.textContent = rawValue.text;
                    i = rawValue.end;
                    continue;
                }
                if (!selfClosing && !voidTags.has(tag)) stack.push(el);
                i = close + 1;
            }
            applyDefaultDisplay(document.body);
            return { ok: true, nodes: countNodes(document.documentElement), title: document.querySelector('title')?.textContent || '' };
        }
    }

    function stripDoctype(text) { return text.replace(/^\s*<!doctype[^>]*>/i, ''); }
    function nextTag(html, i) { const n = html.indexOf('<', i); return n < 0 ? html.length : n; }
    function skipComment(html, i) { const n = html.indexOf('-->', i + 4); return n < 0 ? html.length : n + 3; }
    function readAttrs(el, text) { for (const m of text.matchAll(attrRe)) if (m[1]) el.setAttribute(m[1], decode(m[2] ?? m[3] ?? m[4] ?? '')); }
    function appendText(document, parent, text) { const value = decode(text).replace(/\s+/g, ' ').trim(); if (value) parent.appendChild(document.createTextNode(value)); }
    function closeElement(stack, tag) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].localName === tag) { stack.length = i; return; } }
    function readRaw(html, tag, from) { const endTag = `</${tag}>`; const lower = html.toLowerCase(); const end = lower.indexOf(endTag, from); return end < 0 ? { text: html.slice(from), end: html.length } : { text: html.slice(from, end), end: end + endTag.length }; }
    function canonicalElement(document, tag) { if (tag === 'html') return document.documentElement; if (tag === 'head') return document.head; if (tag === 'body') return document.body; return null; }
    function chooseParent(document, stack, tag) { if (tag === 'html') return document.documentElement; if (tag === 'head') return document.documentElement; if (tag === 'body') return document.documentElement; if (tag === 'title' || tag === 'meta' || tag === 'link' || tag === 'style' || tag === 'script') return document.head; const top = stack[stack.length - 1]; return top === document.documentElement || top === document.head ? document.body : top; }
    function countNodes(node) { return 1 + (node.children || []).reduce((n, child) => n + countNodes(child), 0); }
    function applyDefaultDisplay(node) {
        for (const child of node.children || []) {
            const inlineDisplay = child.style.getPropertyValue?.('display');
            const cascadedDisplay = child.ownerDocument?.cssEngine?.compute(child)?.display;
            if (!inlineDisplay && !cascadedDisplay) child.style.setProperty?.('display', defaultDisplay(child.localName));
            applyDefaultDisplay(child);
        }
    }
    function defaultDisplay(tag) { return ['span','a','b','i','strong','em','small','label','#text'].includes(tag) ? 'inline' : tag === 'script' || tag === 'style' || tag === 'meta' || tag === 'link' ? 'none' : 'block'; }

    return { VirtualHtmlHydrator };
});
