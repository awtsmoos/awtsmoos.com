// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.DOMHydrator = factory(); }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * Chapter 26: The comment stopped becoming a flood.
     * Before this repair, `<!-- ... -->` could be mistaken for text on the
     * parent body; setting `body.textContent` erased earlier children like
     * canvas. Now comments are skipped and text becomes real text nodes, so the
     * vessels already born are never drowned by later whispers.
     */
    function hydrateHTML(document, html = '') {
        if (!document?.body) return { ok: false, count: 0 };
        reset(document.body);
        const body = bodyHTML(html);
        const stack = [document.body];
        let count = 0;
        let ignoredTag = null;
        const re = /<!--([\s\S]*?)-->|<\/(\w[\w:-]*)>|<(\w[\w:-]*)([^>]*)>|([^<]+)/g;
        for (const m of body.matchAll(re)) {
            const isComment = m[1] !== undefined;
            const closing = m[2] ? m[2].toLowerCase() : '';
            const opening = m[3] ? m[3].toLowerCase() : '';

            if (isComment) continue;
            if (ignoredTag) {
                if (closing === ignoredTag) ignoredTag = null;
                continue;
            }
            if (closing) {
                closeStack(stack, closing);
                continue;
            }
            if (opening) {
                const created = openElement(document, stack, opening, m[4] || '', m[0] || '');
                if (created) count++;
                if (opening === 'script' || opening === 'style') ignoredTag = opening;
                continue;
            }
            appendText(document, currentContainer(stack), m[5] || '');
        }
        return { ok: true, count };
    }

    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','source','track','wbr']);
    const skippedTags = new Set(['link','meta']);

    function reset(node) {
        node.children = [];
        node.childNodes = node.children;
        node._textContent = '';
    }

    function openElement(document, stack, tag, rawAttrs, rawToken) {
        if (tag === 'script' || tag === 'style') return null;
        if (skippedTags.has(tag)) return null;
        const el = document.createElement(tag);
        for (const [name, value] of Object.entries(attrsOf(rawAttrs))) el.setAttribute(name, value);
        currentContainer(stack).appendChild(el);
        if (!/\/$/.test(rawToken) && !voidTags.has(tag)) stack.push(templateContainer(el));
        return el;
    }

    function closeStack(stack, closing) {
        for (let i = stack.length - 1; i > 0; i--) {
            const node = stack[i];
            const host = node.host && node.host.localName === closing;
            if (node.localName === closing || host) {
                stack.length = i;
                return;
            }
        }
    }

    function appendText(document, parent, rawText) {
        const text = String(rawText || '').replace(/\s+/g, ' ').trim();
        if (!text) return;
        parent.appendChild(document.createTextNode(text));
    }

    function currentContainer(stack) {
        return stack[stack.length - 1];
    }

    function templateContainer(el) {
        return el.localName === 'template' && el.content ? el.content : el;
    }

    function bodyHTML(html) {
        const m = String(html).match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return m ? m[1] : String(html);
    }

    function attrsOf(raw) {
        const out = {};
        const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of String(raw || '').matchAll(re)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
        return out;
    }

    return { hydrateHTML };
});
