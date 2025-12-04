//B"H
// gl-engine.js - Reusable WebGL2 Engine

export class GLEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
        
        if (!this.gl) {
            console.error("WebGL2 not supported, falling back to WebGL1");
            this.gl = canvas.getContext('webgl', { alpha: true });
        }
        
        if (!this.gl) {
            throw new Error("WebGL not supported");
        }

        this.width = 0;
        this.height = 0;
        this.programs = {};
        this.buffers = {};
        this.textures = {};
        
        // Handle Resize
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.gl.viewport(0, 0, this.width, this.height);
    }

    createShader(type, source) {
        const s = this.gl.createShader(type);
        this.gl.shaderSource(s, source);
        this.gl.compileShader(s);
        if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
            console.error("Shader Compile Error:", this.gl.getShaderInfoLog(s));
            this.gl.deleteShader(s);
            return null;
        }
        return s;
    }

    createProgram(name, vsSrc, fsSrc) {
        const vs = this.createShader(this.gl.VERTEX_SHADER, vsSrc);
        const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSrc);
        
        if(!vs || !fs) return null;

        const p = this.gl.createProgram();
        this.gl.attachShader(p, vs);
        this.gl.attachShader(p, fs);
        this.gl.linkProgram(p);

        if (!this.gl.getProgramParameter(p, this.gl.LINK_STATUS)) {
            console.error("Program Link Error:", this.gl.getProgramInfoLog(p));
            return null;
        }
        
        this.programs[name] = p;
        return p;
    }

    createBuffer(name, data, usage = this.gl.STATIC_DRAW) {
        const b = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, b);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
        this.buffers[name] = b;
        return b;
    }

    createTextureFromCanvas(name, canvasElement) {
        const t = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, t);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvasElement);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        
        // Parameters for non-power-of-2 support if needed, though Mipmaps usually require Po2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
        this.textures[name] = t;
        return t;
    }

    clear() {
        // Clear to transparent black
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}