// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLContext = factory(root.Merkava).VirtualWebGLContext; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;

    /**
     * B"H
     * Chapter 102: WebGL Learned The Questions Three Asks First.
     *
     * This is still a truthful recording context, not a counterfeit GPU. It
     * answers common capability queries and records draw/state commands so
     * WebGL-heavy pages can boot far enough for the simulator to judge real
     * runtime behavior instead of falling through an unimplemented method.
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
            this.enabledCaps = new Set();
            installConstants(this);
        }

        record(op, data = {}) { const entry = { op, ...data }; this.commands.push(entry); this.arena.record(this.texture, 'webgl.' + op, data); return entry; }
        getError() { return 0; }
        getExtension(name) { this.record('getExtension', { name }); return extensionFor(name, this); }
        getSupportedExtensions() { return ['OES_texture_float', 'OES_standard_derivatives', 'WEBGL_depth_texture', 'EXT_color_buffer_float']; }
        getContextAttributes() { return { alpha: true, depth: true, stencil: false, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'default' }; }
        getParameter(param) { return parameterFor(this, param); }
        getShaderPrecisionFormat(shaderType, precisionType) { return { rangeMin: 127, rangeMax: 127, precision: precisionType === this.LOW_FLOAT || precisionType === this.LOW_INT ? 8 : 23 }; }
        isContextLost() { return false; }

        enable(cap) { this.enabledCaps.add(cap); this.record('enable', { cap }); }
        disable(cap) { this.enabledCaps.delete(cap); this.record('disable', { cap }); }
        depthFunc(func) { this.record('depthFunc', { func }); }
        depthMask(flag) { this.record('depthMask', { flag }); }
        blendFunc(sfactor, dfactor) { this.record('blendFunc', { sfactor, dfactor }); }
        blendEquation(mode) { this.record('blendEquation', { mode }); }
        cullFace(mode) { this.record('cullFace', { mode }); }
        frontFace(mode) { this.record('frontFace', { mode }); }
        clearColor(r, g, b, a) { this.clearColorValue = [r, g, b, a]; this.record('clearColor', { value: this.clearColorValue }); }
        colorMask(red, green, blue, alpha) { this.colorMaskValue = [!!red, !!green, !!blue, !!alpha]; this.record('colorMask', { value: this.colorMaskValue }); }
        clearDepth(value) { this.clearDepthValue = value; this.record('clearDepth', { value }); }
        clearStencil(value) { this.clearStencilValue = value; this.record('clearStencil', { value }); }
        stencilMask(mask) { this.stencilMaskValue = mask; this.record('stencilMask', { mask }); }
        stencilFunc(func, ref, mask) { this.record('stencilFunc', { func, ref, mask }); }
        stencilOp(fail, zfail, zpass) { this.record('stencilOp', { fail, zfail, zpass }); }
        stencilFuncSeparate(face, func, ref, mask) { this.record('stencilFuncSeparate', { face, func, ref, mask }); }
        stencilOpSeparate(face, fail, zfail, zpass) { this.record('stencilOpSeparate', { face, fail, zfail, zpass }); }
        stencilMaskSeparate(face, mask) { this.record('stencilMaskSeparate', { face, mask }); }
        clear(mask) { this.record('clear', { mask }); }
        viewport(x, y, width, height) { this.viewportValue = [x, y, width, height]; this.record('viewport', { value: this.viewportValue }); }
        scissor(x, y, width, height) { this.record('scissor', { value: [x, y, width, height] }); }

        createBuffer() { return this.object('buffer'); }
        bindBuffer(target, buffer) { this.boundBuffer = buffer; this.record('bindBuffer', { target, id: buffer?.id ?? null }); }
        bufferData(target, data, usage) { if (this.boundBuffer) this.boundBuffer.data = Array.from(data || []); this.record('bufferData', { target, bytes: data?.length || 0, usage }); }
        bufferSubData(target, offset, data) { this.record('bufferSubData', { target, offset, bytes: data?.length || 0 }); }
        deleteBuffer(buffer) { this.record('deleteBuffer', { id: buffer?.id ?? null }); }

        createShader(type) { const shader = this.object('shader'); shader.type = type; shader.source = ''; shader.compiled = false; return shader; }
        shaderSource(shader, source) { shader.source = String(source || ''); this.record('shaderSource', { id: shader.id, length: shader.source.length }); }
        compileShader(shader) { shader.compiled = true; this.record('compileShader', { id: shader.id }); }
        getShaderParameter(shader, param) { return true; }
        getShaderInfoLog() { return ''; }
        deleteShader(shader) { this.record('deleteShader', { id: shader?.id ?? null }); }

        createProgram() { const program = this.object('program'); program.shaders = []; program.linked = false; return program; }
        attachShader(program, shader) { program.shaders.push(shader); this.record('attachShader', { program: program.id, shader: shader.id }); }
        linkProgram(program) { program.linked = true; this.record('linkProgram', { program: program.id, linked: true }); }
        validateProgram(program) { this.record('validateProgram', { program: program?.id ?? null }); }
        getProgramParameter(program, param) { return param === this.ACTIVE_UNIFORMS || param === this.ACTIVE_ATTRIBUTES ? 0 : true; }
        getProgramInfoLog() { return ''; }
        useProgram(program) { this.currentProgram = program; this.record('useProgram', { program: program?.id ?? null }); }
        deleteProgram(program) { this.record('deleteProgram', { id: program?.id ?? null }); }
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
        uniform1fv(location, value) { this.uniform('uniform1fv', location, Array.from(value || [])); }
        uniform2fv(location, value) { this.uniform('uniform2fv', location, Array.from(value || [])); }
        uniform3fv(location, value) { this.uniform('uniform3fv', location, Array.from(value || [])); }
        uniform4fv(location, value) { this.uniform('uniform4fv', location, Array.from(value || [])); }
        uniformMatrix3fv(location, transpose, value) { this.uniform('uniformMatrix3fv', location, Array.from(value || []), { transpose }); }
        uniformMatrix4fv(location, transpose, value) { this.uniform('uniformMatrix4fv', location, Array.from(value || []), { transpose }); }

        createTexture() { return this.object('texture'); }
        bindTexture(target, texture) { this.boundTexture = texture; this.record('bindTexture', { target, id: texture?.id ?? null }); }
        texParameteri(target, pname, param) { this.record('texParameteri', { target, pname, param }); }
        texImage2D() { this.record('texImage2D', { args: arguments.length }); }
        texSubImage2D() { this.record('texSubImage2D', { args: arguments.length }); }
        texImage3D() { this.record('texImage3D', { args: arguments.length }); }
        texSubImage3D() { this.record('texSubImage3D', { args: arguments.length }); }
        compressedTexImage2D() { this.record('compressedTexImage2D', { args: arguments.length }); }
        compressedTexImage3D() { this.record('compressedTexImage3D', { args: arguments.length }); }
        texImage3D() { this.record('texImage3D', { args: arguments.length }); }
        texSubImage3D() { this.record('texSubImage3D', { args: arguments.length }); }
        compressedTexImage2D() { this.record('compressedTexImage2D', { args: arguments.length }); }
        compressedTexImage3D() { this.record('compressedTexImage3D', { args: arguments.length }); }
        activeTexture(texture) { this.record('activeTexture', { texture }); }
        pixelStorei(pname, param) { this.record('pixelStorei', { pname, param }); }
        generateMipmap(target) { this.record('generateMipmap', { target }); }
        deleteTexture(texture) { this.record('deleteTexture', { id: texture?.id ?? null }); }

        createFramebuffer() { return this.object('framebuffer'); }
        bindFramebuffer(target, framebuffer) { this.boundFramebuffer = framebuffer; this.record('bindFramebuffer', { target, id: framebuffer?.id ?? null }); }
        framebufferTexture2D(target, attachment, textarget, texture, level) { this.record('framebufferTexture2D', { target, attachment, textarget, texture: texture?.id ?? null, level }); }
        checkFramebufferStatus() { return this.FRAMEBUFFER_COMPLETE; }
        drawBuffers(buffers) { this.drawBuffersValue = Array.from(buffers || []); this.record('drawBuffers', { buffers: this.drawBuffersValue }); }
        readBuffer(buffer) { this.record('readBuffer', { buffer }); }
        readPixels(x, y, width, height, format, type, pixels) { if (pixels && typeof pixels.fill === 'function') pixels.fill(0); this.record('readPixels', { x, y, width, height, format, type, bytes: pixels?.length || 0 }); }
        createRenderbuffer() { return this.object('renderbuffer'); }
        bindRenderbuffer(target, renderbuffer) { this.boundRenderbuffer = renderbuffer; this.record('bindRenderbuffer', { target, id: renderbuffer?.id ?? null }); }
        renderbufferStorage(target, internalFormat, width, height) { this.record('renderbufferStorage', { target, internalFormat, width, height }); }
        framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) { this.record('framebufferRenderbuffer', { target, attachment, renderbuffertarget, id: renderbuffer?.id ?? null }); }

        drawArrays(mode, first, count) { this.record('drawArrays', { mode, first, count, program: this.currentProgram?.id ?? null }); }
        drawElements(mode, count, type, offset) { this.record('drawElements', { mode, count, type, offset, program: this.currentProgram?.id ?? null }); }
        object(kind) { const item = { kind, id: this.objects.length }; this.objects.push(item); return item; }
        uniform(op, location, value, extra = {}) { this.record(op, { location, value, ...extra }); }
        snapshot() { return { commands: this.commands, objects: this.objects.length, clearColor: this.clearColorValue || null, viewport: this.viewportValue || null }; }
    }

    function extensionFor(name, gl) {
        const key = String(name || '').toLowerCase();
        if (key === 'oes_vertex_array_object') return { createVertexArrayOES: () => gl.object('vertexArray'), bindVertexArrayOES: vao => gl.record('bindVertexArrayOES', { id: vao?.id ?? null }), deleteVertexArrayOES: vao => gl.record('deleteVertexArrayOES', { id: vao?.id ?? null }) };
        if (key === 'webgl_debug_renderer_info') return { UNMASKED_VENDOR_WEBGL: 0x9245, UNMASKED_RENDERER_WEBGL: 0x9246 };
        return {};
    }

    function parameterFor(gl, param) {
        const table = new Map([
            [gl.VERSION, 'WebGL 1.0 Merkava'], [gl.SHADING_LANGUAGE_VERSION, 'WebGL GLSL ES 1.0 Merkava'],
            [gl.VENDOR, 'Awtsmoos'], [gl.RENDERER, 'Merkava Virtual WebGL'], [gl.MAX_TEXTURE_SIZE, 4096],
            [gl.MAX_CUBE_MAP_TEXTURE_SIZE, 4096], [gl.MAX_RENDERBUFFER_SIZE, 4096], [gl.MAX_VERTEX_ATTRIBS, 16],
            [gl.MAX_VERTEX_UNIFORM_VECTORS, 1024], [gl.MAX_FRAGMENT_UNIFORM_VECTORS, 1024], [gl.MAX_TEXTURE_IMAGE_UNITS, 16],
            [gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, 16], [gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 32], [gl.ALIASED_LINE_WIDTH_RANGE, new Float32Array([1, 1])],
            [gl.ALIASED_POINT_SIZE_RANGE, new Float32Array([1, 64])], [gl.DEPTH_BITS, 24], [gl.STENCIL_BITS, 0]
        ]);
        return table.has(param) ? table.get(param) : 0;
    }

    function installConstants(gl) {
        Object.assign(gl, {
            FALSE: 0, TRUE: 1, NO_ERROR: 0, COLOR_BUFFER_BIT: 0x4000, DEPTH_BUFFER_BIT: 0x0100, STENCIL_BUFFER_BIT: 0x0400,
            ARRAY_BUFFER: 0x8892, ELEMENT_ARRAY_BUFFER: 0x8893, STATIC_DRAW: 0x88E4, DYNAMIC_DRAW: 0x88E8,
            FLOAT: 0x1406, UNSIGNED_SHORT: 0x1403, UNSIGNED_INT: 0x1405, UNSIGNED_BYTE: 0x1401,
            TRIANGLES: 0x0004, TRIANGLE_STRIP: 0x0005, LINES: 0x0001, POINTS: 0x0000,
            VERTEX_SHADER: 0x8B31, FRAGMENT_SHADER: 0x8B30, COMPILE_STATUS: 0x8B81, LINK_STATUS: 0x8B82,
            VALIDATE_STATUS: 0x8B83, ACTIVE_UNIFORMS: 0x8B86, ACTIVE_ATTRIBUTES: 0x8B89,
            LOW_FLOAT: 0x8DF0, MEDIUM_FLOAT: 0x8DF1, HIGH_FLOAT: 0x8DF2, LOW_INT: 0x8DF3, MEDIUM_INT: 0x8DF4, HIGH_INT: 0x8DF5,
            TEXTURE_2D: 0x0DE1, TEXTURE_3D: 0x806F, TEXTURE_2D_ARRAY: 0x8C1A, TEXTURE_CUBE_MAP: 0x8513, TEXTURE0: 0x84C0, RGBA: 0x1908, RGB: 0x1907,
            LINEAR: 0x2601, NEAREST: 0x2600, LINEAR_MIPMAP_LINEAR: 0x2703, NEAREST_MIPMAP_NEAREST: 0x2700,
            CLAMP_TO_EDGE: 0x812F, REPEAT: 0x2901, MIRRORED_REPEAT: 0x8370, TEXTURE_MIN_FILTER: 0x2801,
            TEXTURE_MAG_FILTER: 0x2800, TEXTURE_WRAP_S: 0x2802, TEXTURE_WRAP_T: 0x2803, TEXTURE_WRAP_R: 0x8072, DEPTH_TEST: 0x0B71,
            BLEND: 0x0BE2, CULL_FACE: 0x0B44, SRC_ALPHA: 0x0302, ONE_MINUS_SRC_ALPHA: 0x0303, LEQUAL: 0x0203,
            BACK: 0x0405, CCW: 0x0901, UNPACK_FLIP_Y_WEBGL: 0x9240, FRAMEBUFFER: 0x8D40, RENDERBUFFER: 0x8D41,
            COLOR_ATTACHMENT0: 0x8CE0, COLOR_ATTACHMENT1: 0x8CE1, COLOR_ATTACHMENT2: 0x8CE2, COLOR_ATTACHMENT3: 0x8CE3, DEPTH_ATTACHMENT: 0x8D00, FRAMEBUFFER_COMPLETE: 0x8CD5,
            VERSION: 0x1F02, SHADING_LANGUAGE_VERSION: 0x8B8C, VENDOR: 0x1F00, RENDERER: 0x1F01,
            MAX_TEXTURE_SIZE: 0x0D33, MAX_CUBE_MAP_TEXTURE_SIZE: 0x851C, MAX_RENDERBUFFER_SIZE: 0x84E8,
            MAX_VERTEX_ATTRIBS: 0x8869, MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB, MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD,
            MAX_TEXTURE_IMAGE_UNITS: 0x8872, MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C, MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D,
            ALIASED_LINE_WIDTH_RANGE: 0x846E, ALIASED_POINT_SIZE_RANGE: 0x846D, DEPTH_BITS: 0x0D56, STENCIL_BITS: 0x0D57
        });
    }

    return { VirtualWebGLContext };
});
