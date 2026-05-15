
// B"H
/**
 * @file celestialSphere.js
 * @brief Stable Eighth Sphere generator. Stars are fixed directional vectors.
 */
import { compileShaderProgram } from '../../../shaderCompiler.js';

const VS_STARS = `
    attribute vec3 aPos;
    attribute float aBrightness;

    uniform mat4 uViewProj;
    uniform float uFullCelestialRot; 
    uniform float uSunHeight;

    varying float vAlpha;

    void main() {
        // Celestial Rotation around Y Axis
        float c = cos(uFullCelestialRot);
        float s = sin(uFullCelestialRot);
        vec3 fixedDir = vec3(aPos.x * c - aPos.z * s, aPos.y, aPos.x * s + aPos.z * c);
        
        // Directional projection: w=0 ignores camera translation
        vec4 clipPos = uViewProj * vec4(fixedDir, 0.0);
        gl_Position = clipPos.xyww;
        
        gl_PointSize = 1.0 + aBrightness * 2.0;
        vAlpha = aBrightness * (1.0 - smoothstep(-0.3, 0.1, uSunHeight));
    }
`;

const FS_STARS = `
    precision mediump float;
    varying float vAlpha;

    void main() {
        if(vAlpha < 0.02) discard;
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        gl_FragColor = vec4(vec3(1.0), vAlpha * (1.0 - d * 2.0));
    }
`;

export class CelestialSphere {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.starCount = 12000;
        this.posBuf = null;
        this.brBuf = null;
    }

    init() {
        const gl = this.gl;
        const pI = compileShaderProgram(gl, VS_STARS, FS_STARS);
        this.program = pI.program;

        const positions = new Float32Array(this.starCount * 3);
        const brightness = new Float32Array(this.starCount);

        for(let i=0; i<this.starCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2.0 * Math.PI * u;
            const phi = Math.acos(2.0 * v - 1.0);
            
            positions[i*3]   = Math.sin(phi) * Math.cos(theta);
            positions[i*3+1] = Math.sin(phi) * Math.sin(theta);
            positions[i*3+2] = Math.cos(phi);
            
            brightness[i] = Math.pow(Math.random(), 5.0) * 1.5;
        }

        this.posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        this.brBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brBuf);
        gl.bufferData(gl.ARRAY_BUFFER, brightness, gl.STATIC_DRAW);
    }

    draw(viewProj, sunH, celestialRot) {
        const gl = this.gl;
        if(!this.program) return;
        gl.useProgram(this.program);
        
        // B"H - Enable Additive Blending for glowing stars
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 

        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uViewProj'), false, viewProj);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uSunHeight'), sunH);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uFullCelestialRot'), celestialRot);

        const aP = gl.getAttribLocation(this.program, 'aPos');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
        gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aP);

        const aB = gl.getAttribLocation(this.program, 'aBrightness');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brBuf);
        gl.vertexAttribPointer(aB, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aB);

        gl.drawArrays(gl.POINTS, 0, this.starCount);
    }
}
