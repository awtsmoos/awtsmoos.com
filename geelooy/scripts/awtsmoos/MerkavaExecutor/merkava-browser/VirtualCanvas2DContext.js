// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualCanvas2DContext = factory(root.Merkava).VirtualCanvas2DContext; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
    /**
     * Chapter 17: The 2D canvas becomes a robe over the same WebGL texture.
     *
     * This facade keeps familiar Canvas2D calls while recording compact drawing
     * commands into the shared texture arena. Text is a placeholder command now;
     * later a user-provided font atlas can feed glyph textures without shipping
     * font files from this environment.
     */
    class VirtualCanvas2DContext {
        constructor(canvas, arena = new VirtualWebGLTextureArena()) {
            this.canvas = canvas; this.arena = arena; this.fillStyle = '#000'; this.strokeStyle = '#000'; this.font = '10px sans-serif';
            this.texture = canvas.__webglCanvasTexture || arena.createTexture('canvas-2d', canvas, canvas.width || 0, canvas.height || 0);
            canvas.__webglCanvasTexture = this.texture;
        }
        record(op, data = {}) { return this.arena.record(this.texture, op, data); }
        clearRect(x, y, width, height) { this.record('clearRect', { x, y, width, height }); }
        fillRect(x, y, width, height) { this.record('fillRect', { x, y, width, height, fillStyle: this.fillStyle }); }
        strokeRect(x, y, width, height) { this.record('strokeRect', { x, y, width, height, strokeStyle: this.strokeStyle }); }
        drawImage(image, x, y, width, height) { this.record('drawImageTexture', { sourceTexture: image?.__webglCanvasTexture?.id ?? image?.__webglBoxTexture?.id ?? null, x, y, width: width ?? image?.width ?? 0, height: height ?? image?.height ?? 0 }); }
        fillText(text, x, y) { const run = { text: String(text), x, y, font: this.font, fillStyle: this.fillStyle, note: 'font atlas pending; no font files embedded' }; this.canvas.ownerDocument?.fontAtlas?.recordText(run); this.record('fillTextPlaceholder', run); }
        measureText(text) { return this.canvas.ownerDocument?.fontAtlas?.measure(text, this.font) || { width: String(text).length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }; }
        snapshot() { return this.texture; }
    }
    return { VirtualCanvas2DContext };
});
