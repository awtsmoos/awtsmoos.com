// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLContext = factory(root.Merkava).VirtualWebGLContext; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;

    /**
     * B"H
     * Chapter 36: WebGL became a broader shadow of Chrome.
     * This still records rather than renders, but games may now call the common
     * state, attribute, uniform, texture, blend, and draw APIs without the vessel
     * shattering before runtime truth can be inspected.
     */
    class VirtualWebGLContext {
        constructor(canvas, arena = new VirtualWebGLTextureArena()) {
            this.canvas = canvas;
            this.arena = arena;
            this.texture = canvas.__webglCanvasTexture || arena.createTexture('canvas-webgl', canvas, canvas.width || 0, canvas.height || 0);
            canvas.__webglCanvasTexture = this.texture;
            this.commands = [];
            this.objects = [];
            this.currentProgram = null;
            installConstants(this);
        }

        record(op, data = {}) { const entry = { op, ...data }; this.commands.push(entry); this.arena.record(this.texture, 'webgl.' + op, data); return entry; }
        getError() { return 0; }
        getExtension(name) { this.record('getExtension', { name }); return {}; }
        enable(cap) { this.record('enable', { cap }); }
        disable(cap) { this.record('disable', { cap }); }
        depthFunc(func) { this.record('depthFunc', { func }); }
        blendFunc(sfactor, dfactor) { this.record('blendFunc', { sfactor, dfactor }); }
        cullFace(mode) { this.record('cullFace', { mode }); }
        frontFace(mode) { this.record('frontFace', { mode }); }
        clearColor(r, g, b, a) { this.clearColorValue = [r, g, b, a]; this.record('clearColor', { value: this.clearColorValue }); }
        clearDepth(value) { this.clearDepthValue = value; this.record('clearDepth', { value }); }
        clear(mask) { this.record('clear', { mask }); }
        viewport(x, y, width, height) { this.viewportValue = [x, y, width, height]; this.record('viewport', { value: this.viewportValue }); }
        createBuffer() { return this.object('buffer'); }
        bindBuffer(target, buffer) { this.boundBuffer = buffer; this.record('bindBuffer', { target, id: buffer?.id ?? null }); }
        bufferData(target, data, usage) { if (this.boundBuffer) this.boundBuffer.data = Array.from(data || []); this.record('bufferData', { target, bytes: data?.length || 0, usage }); }
        bufferSubData(target, offset, data) { this.record('bufferSubData', { target, offset, bytes: data?.length || 0 }); }
        createShader(type) { const shader = this.object('shader'); shader.type = type; shader.source = ''; shader.compiled = false; return shader; }
        shaderSource(shader, source) { shader.source = String(source || ''); this.record('shaderSource', { id: shader.id, length: shader.source.length }); }
        compileShader(shader) { shader.compiled = true; this.record('compileShader', { id: shader.id }); }
        getShaderParameter(shader, param) { return true; }
        getShaderInfoLog() { return ''; }
        createProgram() { const program = this.object('program'); program.shaders = []; program.linked = false; return program; }
        attachShader(program, shader) { program.shaders.push(shader); this.record('attachShader', { program: program.id, shader: shader.id }); }
        linkProgram(program) { program.linked = true; this.record('linkProgram', { program: program.id, linked: true }); }
        getProgramParameter(program, param) { return true; }
        getProgramInfoLog() { return ''; }
        useProgram(program) { this.currentProgram = program; this.record('useProgram', { program: program?.id ?? null }); }
        getAttribLocation(program, name) { const key = String(name || ''); program.attribs = program.attribs || {}; if (!(key in program.attribs)) program.attribs[key] = Object.keys(program.attribs).length; return program.attribs[key]; }
        enableVertexAttribArray(location) { this.record('enableVertexAttribArray', { location }); }
        disableVertexAttribArray(location) { this.record('disableVertexAttribArray', { location }); }
        vertexAttribPointer(location, size, type, normalized, stride, offset) { this.record('vertexAttribPointer', { location, size, type, normalized, stride, offset }); }
        getUniformLocation(program, name) { return { program: program?.id ?? null, name: String(name || '') }; }
        uniform1f(location, x) { this.uniform('uniform1f', location, [x]); }
        uniform1i(location, x) { this.uniform('uniform1i', location, [x]); }
        uniform2f(location, x, y) { this.uniform('uniform2f', location, [x, y]); }
        uniform3f(location, x, y, z) { this.uniform('uniform3f', location, [x, y, z]); }
        uniform4f(location, x, y, z, w) { this.uniform('uniform4f', location, [x, y, z, w]); }
        uniformMatrix4fv(location, transpose, value) { this.uniform('uniformMatrix4fv', location, Array.from(value || []), { transpose }); }
        createTexture() { return this.object('texture'); }
        bindTexture(target, texture) { this.boundTexture = texture; this.record('bindTexture', { target, id: texture?.id ?? null }); }
        texParameteri(target, pname, param) { this.record('texParameteri', { target, pname, param }); }
        texImage2D() { this.record('texImage2D', { args: arguments.length }); }
        activeTexture(texture) { this.record('activeTexture', { texture }); }
        pixelStorei(pname, param) { this.record('pixelStorei', { pname, param }); }
        drawArrays(mode, first, count) { this.record('drawArrays', { mode, first, count, program: this.currentProgram?.id ?? null }); }
        drawElements(mode, count, type, offset) { this.record('drawElements', { mode, count, type, offset, program: this.currentProgram?.id ?? null }); }
        object(kind) { const item = { kind, id: this.objects.length }; this.objects.push(item); return item; }
        uniform(op, location, value, extra = {}) { this.record(op, { location, value, ...extra }); }
        snapshot() { return { commands: this.commands, objects: this.objects.length, clearColor: this.clearColorValue || null, viewport: this.viewportValue || null }; }
    }

    function installConstants(gl) {
        Object.assign(gl, {
            FALSE: 0, TRUE: 1, NO_ERROR: 0, COLOR_BUFFER_BIT: 0x4000, DEPTH_BUFFER_BIT: 0x0100,
            ARRAY_BUFFER: 0x8892, ELEMENT_ARRAY_BUFFER: 0x8893, STATIC_DRAW: 0x88E4, DYNAMIC_DRAW: 0x88E8,
            FLOAT: 0x1406, UNSIGNED_SHORT: 0x1403, UNSIGNED_BYTE: 0x1401, TRIANGLES: 0x0004, TRIANGLE_STRIP: 0x0005,
            VERTEX_SHADER: 0x8B31, FRAGMENT_SHADER: 0x8B30, COMPILE_STATUS: 0x8B81, LINK_STATUS: 0x8B82,
            TEXTURE_2D: 0x0DE1, TEXTURE0: 0x84C0, RGBA: 0x1908, RGB: 0x1907, LINEAR: 0x2601, NEAREST: 0x2600,
            CLAMP_TO_EDGE: 0x812F, TEXTURE_MIN_FILTER: 0x2801, TEXTURE_MAG_FILTER: 0x2800, TEXTURE_WRAP_S: 0x2802,
            TEXTURE_WRAP_T: 0x2803, DEPTH_TEST: 0x0B71, BLEND: 0x0BE2, CULL_FACE: 0x0B44, SRC_ALPHA: 0x0302,
            ONE_MINUS_SRC_ALPHA: 0x0303, LEQUAL: 0x0203, BACK: 0x0405, CCW: 0x0901, UNPACK_FLIP_Y_WEBGL: 0x9240
        });
    }

    return { VirtualWebGLContext };
});
