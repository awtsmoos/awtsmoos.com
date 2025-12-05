
// B"H
// WebGL Micro-Library
// Stateless utilities for raw GL interaction.

export const GL = {
    createContext(canvas) {
        const gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: false });
        if (!gl) {
            console.error("WebGL context creation failed");
            return null;
        }
        return gl;
    },

    compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    },

    createProgram(gl, vsSource, fsSource) {
        const vs = this.compileShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
        
        if (!vs || !fs) return null;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program Link Error:", gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    },

    createBuffer(gl) {
        return gl.createBuffer();
    },

    resize(gl) {
        if (!gl || !gl.canvas) return;
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    },

    // Generic Draw Call for Point Sprites
    drawPoints(gl, program, buffer, data, attributeLayout) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        // Bind Data
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

        // Setup Attributes based on layout config
        // layout: [{ name: 'a_pos', size: 2 }, { name: 'a_alpha', size: 1 } ...]
        const FSIZE = 4;
        let stride = 0;
        attributeLayout.forEach(a => stride += a.size);
        stride = stride * FSIZE;

        let offset = 0;
        attributeLayout.forEach(attr => {
            const loc = gl.getAttribLocation(program, attr.name);
            if (loc !== -1) {
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, attr.size, gl.FLOAT, false, stride, offset * FSIZE);
            }
            offset += attr.size;
        });

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.drawArrays(gl.POINTS, 0, data.length / (stride/FSIZE));
    }
};
