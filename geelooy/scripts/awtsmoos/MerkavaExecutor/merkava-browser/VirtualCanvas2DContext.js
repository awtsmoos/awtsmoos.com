// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualCanvas2DContext = factory(root.Merkava).VirtualCanvas2DContext; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;

    /**
     * B"H
     * Chapter 37: The 2D canvas learned rounded vessels too.
     * Games may now speak path, curve, transform, gradient, text, and roundRect
     * prayers. Merkava records the gestures into the arena for deterministic
     * runtime comparison while remaining safely headless.
     */
    class VirtualCanvas2DContext {
        constructor(canvas, arena = new VirtualWebGLTextureArena()) {
            this.canvas = canvas; this.arena = arena; this.fillStyle = '#000'; this.strokeStyle = '#000'; this.font = '10px sans-serif';
            this.globalAlpha = 1; this.lineWidth = 1; this.lineCap = 'butt'; this.lineJoin = 'miter'; this.textAlign = 'start'; this.textBaseline = 'alphabetic';
            this.shadowColor = 'transparent'; this.shadowBlur = 0; this.shadowOffsetX = 0; this.shadowOffsetY = 0; this.imageSmoothingEnabled = true;
            this.__stack = []; this.__path = []; this.__lineDash = []; this.__transform = [1, 0, 0, 1, 0, 0];
            this.texture = canvas.__webglCanvasTexture || arena.createTexture('canvas-2d', canvas, canvas.width || 0, canvas.height || 0);
            canvas.__webglCanvasTexture = this.texture;
        }
        record(op, data = {}) { return this.arena.record(this.texture, op, { ...data, state: this.state() }); }
        state() { return { fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, font: this.font, globalAlpha: this.globalAlpha, lineWidth: this.lineWidth, lineCap: this.lineCap, lineJoin: this.lineJoin, textAlign: this.textAlign, textBaseline: this.textBaseline, transform: this.__transform.slice() }; }
        save() { this.__stack.push({ ...this.state(), lineDash: this.__lineDash.slice() }); this.record('save'); }
        restore() { const old = this.__stack.pop(); if (old) { Object.assign(this, old); this.__lineDash = old.lineDash || []; } this.record('restore'); }
        beginPath() { this.__path = []; this.record('beginPath'); }
        closePath() { this.__path.push(['closePath']); this.record('closePath'); }
        moveTo(x, y) { this.__path.push(['moveTo', x, y]); this.record('moveTo', { x, y }); }
        lineTo(x, y) { this.__path.push(['lineTo', x, y]); this.record('lineTo', { x, y }); }
        rect(x, y, width, height) { this.__path.push(['rect', x, y, width, height]); this.record('rect', { x, y, width, height }); }
        roundRect(x, y, width, height, radii = 0) { const r = normalizeRadii(radii); this.__path.push(['roundRect', x, y, width, height, r]); this.record('roundRect', { x, y, width, height, radii: r }); return this; }
        arc(x, y, radius, startAngle, endAngle, anticlockwise = false) { this.__path.push(['arc', x, y, radius, startAngle, endAngle, anticlockwise]); this.record('arc', { x, y, radius, startAngle, endAngle, anticlockwise }); }
        ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) { this.__path.push(['ellipse', x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise]); this.record('ellipse', { x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise }); }
        quadraticCurveTo(cpx, cpy, x, y) { this.__path.push(['quadraticCurveTo', cpx, cpy, x, y]); this.record('quadraticCurveTo', { cpx, cpy, x, y }); }
        bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this.__path.push(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]); this.record('bezierCurveTo', { cp1x, cp1y, cp2x, cp2y, x, y }); }
        fill() { this.record('fillPath', { path: this.__path.slice() }); }
        stroke() { this.record('strokePath', { path: this.__path.slice() }); }
        clip() { this.record('clip', { path: this.__path.slice() }); }
        clearRect(x, y, width, height) { this.record('clearRect', { x, y, width, height }); }
        fillRect(x, y, width, height) { this.record('fillRect', { x, y, width, height, fillStyle: this.fillStyle }); }
        strokeRect(x, y, width, height) { this.record('strokeRect', { x, y, width, height, strokeStyle: this.strokeStyle }); }
        drawImage(image, ...args) { const box = imageBox(image, args); this.record('drawImageTexture', { sourceTexture: image?.__webglCanvasTexture?.id ?? image?.__webglBoxTexture?.id ?? null, ...box }); }
        fillText(text, x, y, maxWidth) { const run = { text: String(text), x, y, maxWidth, font: this.font, fillStyle: this.fillStyle, note: 'font atlas pending; no font files embedded' }; this.canvas.ownerDocument?.fontAtlas?.recordText(run); this.record('fillTextPlaceholder', run); }
        strokeText(text, x, y, maxWidth) { this.record('strokeTextPlaceholder', { text: String(text), x, y, maxWidth, font: this.font, strokeStyle: this.strokeStyle }); }
        measureText(text) { return this.canvas.ownerDocument?.fontAtlas?.measure(text, this.font) || { width: String(text).length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }; }
        translate(x, y) { this.__transform[4] += Number(x) || 0; this.__transform[5] += Number(y) || 0; this.record('translate', { x, y }); }
        rotate(angle) { this.record('rotate', { angle }); }
        scale(x, y) { this.__transform[0] *= Number(x) || 1; this.__transform[3] *= Number(y) || 1; this.record('scale', { x, y }); }
        transform(a, b, c, d, e, f) { this.__transform = [a, b, c, d, e, f].map(Number); this.record('transform', { a, b, c, d, e, f }); }
        setTransform(a, b, c, d, e, f) { this.__transform = arguments.length ? [a, b, c, d, e, f].map(Number) : [1, 0, 0, 1, 0, 0]; this.record('setTransform', { transform: this.__transform.slice() }); }
        resetTransform() { this.__transform = [1, 0, 0, 1, 0, 0]; this.record('resetTransform'); }
        setLineDash(value = []) { this.__lineDash = Array.from(value); this.record('setLineDash', { value: this.__lineDash }); }
        getLineDash() { return this.__lineDash.slice(); }
        createLinearGradient(x0, y0, x1, y1) { return gradient('linear', { x0, y0, x1, y1 }); }
        createRadialGradient(x0, y0, r0, x1, y1, r1) { return gradient('radial', { x0, y0, r0, x1, y1, r1 }); }
        createPattern(image, repetition = 'repeat') { return { kind: 'pattern', image, repetition, toString: () => '[object CanvasPattern]' }; }
        getImageData(x, y, width, height) { return { data: new Uint8ClampedArray(Math.max(0, width * height * 4)), width, height }; }
        putImageData(imageData, x, y) { this.record('putImageData', { x, y, width: imageData?.width || 0, height: imageData?.height || 0 }); }
        snapshot() { return this.texture; }
    }
    function normalizeRadii(radii) { const list = Array.isArray(radii) ? radii : [radii]; return list.map(v => typeof v === 'object' ? { x: Number(v.x) || 0, y: Number(v.y) || 0 } : { x: Number(v) || 0, y: Number(v) || 0 }); }
    function gradient(kind, data) { return { kind, stops: [], ...data, addColorStop(offset, color) { this.stops.push({ offset, color }); }, toString() { return `[object CanvasGradient:${kind}]`; } }; }
    function imageBox(image, args) { if (args.length <= 2) return { x: args[0] || 0, y: args[1] || 0, width: image?.width || 0, height: image?.height || 0 }; if (args.length <= 4) return { x: args[0] || 0, y: args[1] || 0, width: args[2] || image?.width || 0, height: args[3] || image?.height || 0 }; return { sx: args[0], sy: args[1], sw: args[2], sh: args[3], x: args[4], y: args[5], width: args[6], height: args[7] }; }
    return { VirtualCanvas2DContext };
});
