// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLBoxRenderer = factory(root.Merkava).VirtualWebGLBoxRenderer; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
    const hiddenTags = new Set(['head', 'script', 'style', 'meta', 'link', 'title', 'option']);
    const inlineTags = new Set(['#text', 'span', 'a', 'b', 'i', 'strong', 'em', 'small', 'label']);
    const n = value => Number(String(value || '0').replace(/px$/, '')) || 0;
    const textOf = element => element.nodeType === 3 ? element.textContent : element.textContent;

    /**
     * Chapter 16: CSS boxes become quads in the hidden sea of WebGL.
     *
     * This is still intentionally small, but it now belongs to the executor:
     * visibility, CSS sizing, block flow, inline-ish text placement, and skipped
     * non-visual nodes are decided here before C receives simple paint ops.
     */
    class VirtualWebGLBoxRenderer {
        constructor(arena = new VirtualWebGLTextureArena()) { this.arena = arena; }
        ensureTexture(element) {
            if (!element.__webglBoxTexture) element.__webglBoxTexture = this.arena.createTexture('dom-box', element, 0, 0);
            return element.__webglBoxTexture;
        }
        paintElement(element, x = 0, y = 0, containingWidth = 760) {
            if (!element || this.isHidden(element)) return { width: 0, height: 0 };
            const style = this.computed(element);
            if (style.display === 'none') return { width: 0, height: 0 };
            const metrics = this.measure(element, style, containingWidth);
            const texture = this.ensureTexture(element);
            texture.width = metrics.width; texture.height = metrics.height;
            this.arena.record(texture, 'paintBox', {
                x, y, width: metrics.width, height: metrics.height,
                padding: metrics.padding, margin: metrics.margin, border: metrics.border,
                background: style['background-color'] || style.backgroundColor || '',
                color: style.color || '', display: style.display || 'block'
            });
            const directText = this.directText(element);
            if (directText) this.arena.record(texture, 'paintTextPlaceholder', {
                text: directText, x: x + metrics.padding + metrics.border + 2, y: y + metrics.padding + metrics.border + 14,
                color: style.color || '#111111', note: 'native host draws glyphs from executor text command'
            });
            let childY = y + metrics.padding + metrics.border + (directText ? 20 : 0);
            let childX = x + metrics.padding + metrics.border;
            const innerWidth = Math.max(0, metrics.width - metrics.padding * 2 - metrics.border * 2);
            for (const child of element.children || []) {
                if (this.isHidden(child)) continue;
                const childStyle = this.computed(child);
                if (childStyle.display === 'none') continue;
                const isInline = childStyle.display === 'inline' || inlineTags.has(child.localName);
                const box = this.paintElement(child, childX, childY, innerWidth || containingWidth);
                if (isInline) childX += box.width || this.measureText(child).width;
                else { childY += box.height || 0; childX = x + metrics.padding + metrics.border; }
            }
            return metrics;
        }
        isHidden(element) { return !!element.hidden || hiddenTags.has(element.localName); }
        computed(element) { return element.ownerDocument?.cssEngine?.compute(element) || element.style?.toJSON?.() || {}; }
        directText(element) {
            if (!element) return '';
            if (element.localName === 'input') return String(element.value || element.placeholder || '').trim();
            if (element.localName === 'textarea') return String(element.value || element.textContent || element.placeholder || '').trim();
            if (element.localName === 'select') return String((element.children || []).find(child => child.selected)?.textContent || element.value || '').trim();
            if (element.nodeType === 3) return String(element._textContent || '').trim();
            return String(element._textContent || '').trim();
        }
        measureText(element) { const text = this.directText(element); return { width: Math.max(0, text.length * 8), height: text ? 20 : 0 }; }
        measure(element, style, containingWidth) {
            const padding = n(style.padding), margin = n(style.margin), border = n(style['border-width']);
            const explicitWidth = n(style.width), explicitHeight = n(style.height), minHeight = n(style['min-height']);
            const text = this.measureText(element);
            let childHeight = 0, childWidth = 0;
            for (const child of element.children || []) {
                if (this.isHidden(child)) continue;
                const childStyle = this.computed(child);
                if (childStyle.display === 'none') continue;
                const childBox = this.measure(child, childStyle, containingWidth);
                childHeight += childBox.height;
                childWidth = Math.max(childWidth, childBox.width);
            }
            const width = explicitWidth || (style.display === 'inline' ? text.width : Math.max(childWidth, Math.min(containingWidth || 760, 760)));
            const contentHeight = Math.max(text.height, childHeight, minHeight, explicitHeight);
            const height = explicitHeight || contentHeight + padding * 2 + border * 2 + margin;
            return { width, height, padding, margin, border };
        }
        snapshot() { return this.arena.snapshot(); }
    }
    return { VirtualWebGLBoxRenderer };
});
