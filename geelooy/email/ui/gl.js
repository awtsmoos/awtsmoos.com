// B"H
// The GL Chain: A lightweight WebGL2 wrapper for shader insanity

export class GLChain {
    constructor(canvas) {
        this.canvas = canvas;
        try {
            this.gl = canvas.getContext('webgl2', { 
                alpha: true, 
                antialias: true, 
                powerPreference: "high-performance",
                premultipliedAlpha: false
            });
        } catch(e) {}
        
        if (!this.gl) {
            console.warn("WebGL2 not supported - Quantum effects disabled.");
            return;
        }

        this.programs = {};
        this.activeProgram = null;
        this.textures = {};
        this.buffers = {};
        
        // Handle resizing automatically
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if(!this.gl) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader Compile Error:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(name, vertSource, fragSource) {
        if(!this.gl) return this;
        const vert = this.createShader(this.gl.VERTEX_SHADER, vertSource);
        const frag = this.createShader(this.gl.FRAGMENT_SHADER, fragSource);
        if(!vert || !frag) return this;

        const prog = this.gl.createProgram();
        this.gl.attachShader(prog, vert);
        this.gl.attachShader(prog, frag);
        this.gl.linkProgram(prog);

        if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
            console.error("Program Link Error:", this.gl.getProgramInfoLog(prog));
            return this;
        }
        this.programs[name] = { id: prog, uniforms: {}, attributes: {} };
        return this;
    }

    use(name) {
        if(!this.gl || !this.programs[name]) return this;
        this.activeProgram = this.programs[name];
        this.gl.useProgram(this.activeProgram.id);
        return this;
    }

    setUniform(name, type, value) {
        if(!this.activeProgram) return this;
        const p = this.activeProgram;
        // Cache location
        if (p.uniforms[name] === undefined) {
            p.uniforms[name] = this.gl.getUniformLocation(p.id, name);
        }
        const loc = p.uniforms[name];
        if(!loc) return this; // Uniform optimized out

        if (type === '1f') this.gl.uniform1f(loc, value);
        if (type === '2f') this.gl.uniform2f(loc, value[0], value[1]);
        if (type === '3f') this.gl.uniform3f(loc, value[0], value[1], value[2]);
        if (type === '1i') this.gl.uniform1i(loc, value);
        if (type === 'mat4') this.gl.uniformMatrix4fv(loc, false, value);
        return this;
    }

    createBuffer(name, data, usage = this.gl.STATIC_DRAW) {
        if(!this.gl) return this;
        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
        this.buffers[name] = buf;
        return this;
    }

    bindAttribute(name, bufferName, size, type = this.gl.FLOAT, normalize = false, stride = 0, offset = 0, divisor = 0) {
        if(!this.activeProgram) return this;
        const p = this.activeProgram;
        
        if (p.attributes[name] === undefined) {
            p.attributes[name] = this.gl.getAttribLocation(p.id, name);
        }
        const loc = p.attributes[name];
        if (loc === -1) return this; // Attribute optimized out

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[bufferName]);
        this.gl.enableVertexAttribArray(loc);
        this.gl.vertexAttribPointer(loc, size, type, normalize, stride, offset);
        
        // Instancing magic
        if (divisor > 0) this.gl.vertexAttribDivisor(loc, divisor);
        else this.gl.vertexAttribDivisor(loc, 0); // Reset if standard
        return this;
    }

    createTextureFromCanvas(name, sourceCanvas) {
        if(!this.gl) return this;
        const tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        // Pixelate for crisp text
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, sourceCanvas);
        this.textures[name] = tex;
        return this;
    }

    bindTexture(name, unit = 0) {
        if(!this.gl) return this;
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[name]);
        return this;
    }

    clear(r, g, b, a) {
        if(!this.gl) return this;
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // Standard blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE); // Additive blending for glow
        return this;
    }

    drawInstanced(mode, count, instanceCount) {
        if(!this.gl) return this;
        this.gl.drawArraysInstanced(mode, 0, count, instanceCount);
        return this;
    }
}