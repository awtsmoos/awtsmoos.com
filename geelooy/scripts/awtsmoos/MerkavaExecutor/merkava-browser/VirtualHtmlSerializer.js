// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualHtmlSerializer = factory().VirtualHtmlSerializer; }
})(typeof self !== 'undefined' ? self : this, function() {
    const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const attrs = element => Object.entries(element.attributes || {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
    class VirtualHtmlSerializer {
        serialize(element) {
            if (element.tagName === '#TEXT') return esc(element.textContent || '');
            const tag = String(element.tagName || 'div').toLowerCase();
            return `<${tag}${attrs(element)}>${esc(element.textContent || '')}${(element.children || []).map(child => this.serialize(child)).join('')}</${tag}>`;
        }
        serializeChildren(element) { return `${esc(element.textContent || '')}${(element.children || []).map(child => this.serialize(child)).join('')}`; }
        parseInto(element, html) {
            element.children.length = 0; element.textContent = '';
            const source = String(html || '');
            const tagRe = /<([a-zA-Z0-9-]+)([^>]*)>(.*?)<\/\1>/gs;
            let last = 0, match;
            while ((match = tagRe.exec(source))) {
                if (match.index > last) element.textContent += source.slice(last, match.index).replace(/<[^>]+>/g, '');
                const child = element.ownerDocument.createElement(match[1]);
                for (const attr of match[2].matchAll(/([\w-]+)=["']([^"']*)["']/g)) child.setAttribute(attr[1], attr[2]);
                child.innerHTML = match[3];
                element.appendChild(child);
                last = tagRe.lastIndex;
            }
            if (last < source.length) element.textContent += source.slice(last).replace(/<[^>]+>/g, '');
        }
    }
    return { VirtualHtmlSerializer };
});
