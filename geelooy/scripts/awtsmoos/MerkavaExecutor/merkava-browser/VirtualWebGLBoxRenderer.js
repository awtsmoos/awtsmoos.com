// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLBoxRenderer = factory(root.Merkava).VirtualWebGLBoxRenderer; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
    const n = value => Number(String(value || '0').replace(/px$/, '')) || 0;
    /** Chapter 16: CSS boxes become quads in the hidden sea of WebGL. */
    class VirtualWebGLBoxRenderer {
        constructor(arena = new VirtualWebGLTextureArena()) { this.arena = arena; }
        ensureTexture(element) {
            if (!element.__webglBoxTexture) element.__webglBoxTexture = this.arena.createTexture('dom-box', element, n(element.style.width), n(element.style.height));
            return element.__webglBoxTexture;
        }
        paintElement(element, x = 0, y = 0) {
            const texture = this.ensureTexture(element), style = element.ownerDocument?.cssEngine?.compute(element) || element.style?.toJSON?.() || {};
            const width = n(style.width) || 0, height = n(style.height) || 0;
            texture.width = width; texture.height = height;
            const padding = n(style.padding), margin = n(style.margin), border = n(style['border-width']);
            this.arena.record(texture, 'paintBox', { x, y, width, height, padding, margin, border, background: style['background-color'] || style.backgroundColor || '', color: style.color || '', display: style.display || 'block' });
            if (element.textContent) this.arena.record(texture, 'paintTextPlaceholder', { text: element.textContent, x: x + padding + border, y: y + padding + border, color: style.color || '', note: 'font atlas pending; no font files embedded' });
            let childY = y;
            for (const child of element.children || []) { this.paintElement(child, x, childY); childY += n(child.style?.height) || 0; }
            return texture;
        }
        snapshot() { return this.arena.snapshot(); }
    }
    return { VirtualWebGLBoxRenderer };
});
