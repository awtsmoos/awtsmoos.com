// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLContext = factory().VirtualWebGLContext; }
})(typeof self !== 'undefined' ? self : this, function() {
    const { VirtualWebGLTextureArena } = require('./VirtualWebGLTextureArena.js');
    /**
     * Chapter 12: The Awtsmoos paints photons before the screen exists.
     *
     * A compact headless WebGL seed: it records clear color, viewport, buffers,
     * shaders, programs and draw calls as deterministic command data. It is not
     * GPU execution yet; it is the first bytecode-friendly graphics arena for a
     * future WebGL DOM renderer sitting beneath the virtual document.
     */
    class VirtualWebGLContext {
        constructor(canvas, arena = new VirtualWebGLTextureArena()) {
            this.canvas = canvas; this.arena = arena; this.texture = canvas.__webglCanvasTexture || arena.createTexture('canvas-webgl', canvas, canvas.width || 0, canvas.height || 0); canvas.__webglCanvasTexture = this.texture;
            this.commands = []; this.objects = []; this.currentProgram = null;
            this.COLOR_BUFFER_BIT = 0x4000; this.ARRAY_BUFFER = 0x8892; this.STATIC_DRAW = 0x88E4;
            this.VERTEX_SHADER = 0x8B31; this.FRAGMENT_SHADER = 0x8B30; this.TRIANGLES = 0x0004;
        }
        record(op, data = {}) { const entry = { op, ...data }; this.commands.push(entry); this.arena.record(this.texture, 'webgl.' + op, data); return entry; }
        clearColor(r, g, b, a) { this.clearColorValue = [r, g, b, a]; this.record('clearColor', { value: this.clearColorValue }); }
        clear(mask) { this.record('clear', { mask }); }
        viewport(x, y, width, height) { this.viewportValue = [x, y, width, height]; this.record('viewport', { value: this.viewportValue }); }
        createBuffer() { const buffer = { kind: 'buffer', id: this.objects.length }; this.objects.push(buffer); return buffer; }
        bindBuffer(target, buffer) { this.boundBuffer = buffer; this.record('bindBuffer', { target, id: buffer?.id ?? null }); }
        bufferData(target, data, usage) { if (this.boundBuffer) this.boundBuffer.data = Array.from(data || []); this.record('bufferData', { target, bytes: data?.length || 0, usage }); }
        createShader(type) { const shader = { kind: 'shader', id: this.objects.length, type, source: '', compiled: false }; this.objects.push(shader); return shader; }
        shaderSource(shader, source) { shader.source = String(source || ''); this.record('shaderSource', { id: shader.id, length: shader.source.length }); }
        compileShader(shader) { shader.compiled = true; this.record('compileShader', { id: shader.id }); }
        createProgram() { const program = { kind: 'program', id: this.objects.length, shaders: [], linked: false }; this.objects.push(program); return program; }
        attachShader(program, shader) { program.shaders.push(shader); this.record('attachShader', { program: program.id, shader: shader.id }); }
        linkProgram(program) { program.linked = program.shaders.every(shader => shader.compiled); this.record('linkProgram', { program: program.id, linked: program.linked }); }
        useProgram(program) { this.currentProgram = program; this.record('useProgram', { program: program?.id ?? null }); }
        drawArrays(mode, first, count) { this.record('drawArrays', { mode, first, count, program: this.currentProgram?.id ?? null }); }
        snapshot() { return { commands: this.commands, objects: this.objects.length, clearColor: this.clearColorValue || null, viewport: this.viewportValue || null }; }
    }
    return { VirtualWebGLContext };
});
