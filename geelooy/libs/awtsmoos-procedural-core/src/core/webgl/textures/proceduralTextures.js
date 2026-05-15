
// B"H
import { compileShaderProgram } from '../shaderCompiler.js';
import { SHADER_DIRT } from './generators/dirt.js';
import { SHADER_BRICK } from './generators/brick.js';
import { SHADER_TILE } from './generators/tile.js';
import { SHADER_CLOTH } from './generators/cloth.js';
import { SHADER_BARK } from './generators/bark.js';
import { SHADER_BARK_PINE } from './generators/bark_pine.js';
import { SHADER_BARK_BIRCH } from './generators/bark_birch.js';
import { SHADER_LEAF } from './generators/leaf.js';
import { SHADER_LEAF_PINE } from './generators/leaf_pine.js';
import { SHADER_LEAF_OAK } from './generators/leaf_oak.js';
import { SHADER_LEAF_BIRCH } from './generators/leaf_birch.js';
import { SHADER_LEAF_ASH } from './generators/leaf_ash.js';
import { SHADER_SAND } from './generators/sand.js';

const SHADERS = {
    'dirt': SHADER_DIRT, // B"H - Now high-fidelity soil
    'brick': SHADER_BRICK,
    'tile': SHADER_TILE,
    'cloth': SHADER_CLOTH,
    'bark': SHADER_BARK, 
    'oak': SHADER_BARK, 
    'pine': SHADER_BARK_PINE,
    'birch': SHADER_BARK_BIRCH,
    'leaf': SHADER_LEAF,
    'leaf_pine': SHADER_LEAF_PINE,
    'leaf_oak': SHADER_LEAF_OAK,
    'leaf_birch': SHADER_LEAF_BIRCH,
    'leaf_ash': SHADER_LEAF_ASH,
    'sand': SHADER_DIRT // B"H - Using dirt logic for sand variance
};

export class TextureGenerator {
    constructor(gl) {
        this.gl = gl;
        this.textures = {};
        this.framebuffer = gl.createFramebuffer();
        this.quadBuffer = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    }

    generate(name, type, width=1024, height=1024) { // Increased resolution
        if (this.textures[name]) return this.textures[name];
        
        const gl = this.gl;
        const shaderSource = SHADERS[type];
        if (!shaderSource) return null;

        console.log(`B"H - Manifesting Texture: ${name} (${type})`);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        const vs = `attribute vec2 p; void main(){ gl_Position=vec4(p,0,1); }`;
        const programInfo = compileShaderProgram(gl, vs, shaderSource);
        if (!programInfo) return null;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        gl.viewport(0, 0, width, height);
        gl.useProgram(programInfo.program);
        gl.uniform2f(gl.getUniformLocation(programInfo.program, 'uResolution'), width, height);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        const loc = gl.getAttribLocation(programInfo.program, 'p');
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        this.textures[name] = texture;
        return texture;
    }
}
