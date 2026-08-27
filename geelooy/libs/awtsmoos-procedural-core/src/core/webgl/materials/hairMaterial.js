
// B"H
/**
 * @file hairMaterial.js
 * @brief Refined shader for Realistic Short Hair. Fixes the "weird bend" issues.
 */
import { mat4_core } from '../../math/mat4/core.js';

export const VS_SOURCE_HAIR = `
    attribute vec3 aVertexPosition; 
    attribute vec3 aInstanceOffset; 
    attribute vec3 aInstanceNormal; 
    attribute float aInstanceRandom; 

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uModelMatrix; 
    uniform highp float uTime; 
    
    uniform float uStrandLength;
    uniform float uStrandWidth;
    uniform vec3 uCombDirection;   
    uniform float uCombStrength;
    uniform float uTaper;

    varying vec3 vNormal;
    varying vec3 vTangent;
    varying vec3 vWorldPos;
    varying float vHeight;

    void main(void) {
        float h = aVertexPosition.y; 
        vHeight = h;
        
        // B"H - UNIFORM THICKNESS: Taper is minimized (uTaper should be ~0.1)
        float taper = mix(1.0, smoothstep(1.0, 0.2, h), uTaper); 
        float w = uStrandWidth * taper; 
        float l = uStrandLength * (0.9 + aInstanceRandom * 0.2);
        
        vec3 normal = normalize(aInstanceNormal);
        
        // B"H - STABILIZED GROWTH:
        // Follow the normal mostly, with a small, stable bias from gravity.
        vec3 growDir = normalize(mix(normal, uCombDirection, h * uCombStrength * 0.5));
        
        // Stable Pos calculation
        vec3 pos = growDir * h * l;
        
        // Subtle natural wobble, not a weird bend
        float wobble = sin(h * 15.0 + aInstanceRandom * 20.0) * 0.01 * h;
        pos += vec3(wobble);

        vec3 tangentDir = growDir; 
        
        vec3 refUp = abs(tangentDir.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
        vec3 binormal = normalize(cross(tangentDir, refUp)); 
        vec3 tubeNormal = normalize(cross(binormal, tangentDir)); 
        
        vec3 localOffset = binormal * aVertexPosition.x * w + tubeNormal * aVertexPosition.z * w;
        vec3 finalLocalPos = aInstanceOffset + pos + localOffset;
        
        vec4 worldPos4 = uModelMatrix * vec4(finalLocalPos, 1.0);
        vWorldPos = worldPos4.xyz;
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(finalLocalPos, 1.0);
        
        mat3 worldMat3 = mat3(uModelMatrix);
        vTangent = normalize(worldMat3 * tangentDir);
        vec3 localFaceNormal = normalize(binormal * aVertexPosition.x + tubeNormal * aVertexPosition.z);
        vNormal = normalize(worldMat3 * localFaceNormal);
    }
`;

export const FS_SOURCE_HAIR = `
    precision highp float;
    #include <noise>
    #include <toneMapping>
    
    varying vec3 vNormal;
    varying vec3 vTangent;
    varying vec3 vWorldPos;
    varying float vHeight;
    
    uniform vec3 uBaseColor;
    uniform vec3 uTipColor;
    uniform vec3 uLightDirection;
    uniform vec3 uDirectionalLightColor;
    uniform vec3 uAmbientLightColor;
    uniform vec3 uViewPos;

    void main(void) {
        vec3 N = normalize(vNormal);
        vec3 T = normalize(vTangent);
        vec3 L = normalize(uLightDirection);
        vec3 V = normalize(uViewPos - vWorldPos);
        vec3 H = normalize(L + V);

        // Kajiya-Kay
        float dotTH = dot(T, H);
        float sinTH = sqrt(max(0.0, 1.0 - dotTH * dotTH));
        float spec = pow(sinTH, 64.0) * 0.35;

        float diff = sqrt(max(0.0, 1.0 - dot(T, L)*dot(T, L))); 
        diff = diff * 0.7 + 0.3;

        vec3 hairColor = mix(uBaseColor, uTipColor, vHeight);
        float ao = smoothstep(0.0, 0.3, vHeight);
        
        vec3 finalColor = (uAmbientLightColor * hairColor * (0.2 + 0.8 * ao)) + 
                          (uDirectionalLightColor * (diff * hairColor + spec) * ao);
        
        gl_FragColor = vec4(pow(aces(finalColor * 0.9), vec3(0.4545)), 1.0);
    }
`;

export class HairMaterial {
    constructor(gl) { this.gl = gl; }
    setProgram(p) { this.program = p.program; }
    draw(obj, context) {
        const { renderer, projectionMatrix, viewMatrix, worldModelMatrix, globalShaderVars, cameraPos } = context;
        const gl = this.gl, ext = gl.extInstanced;
        if (!this.program || !ext || !obj.buffers || obj.buffers.instanceCount <= 0) return;
        gl.useProgram(this.program);
        let mv = mat4_core.identity(); mat4_core.multiply(mv, viewMatrix, worldModelMatrix);
        const hp = obj.hairParams || {};
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelViewMatrix'), false, mv);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelMatrix'), false, worldModelMatrix);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uStrandLength'), hp.length || 0.25);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uStrandWidth'), hp.width || 0.015);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTaper'), 0.1); 
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uCombDirection'), [0, -1, 0]);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uCombStrength'), 0.15);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uBaseColor'), hp.colorBase || [0.08, 0.04, 0.01]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uTipColor'), hp.colorTip || [0.3, 0.15, 0.08]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), globalShaderVars.uLightDirection || [0.5, 1, 0.5]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), globalShaderVars.uDirectionalLightColor || [1, 1, 1]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), globalShaderVars.uAmbientLightColor || [0.2, 0.2, 0.2]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uViewPos'), cameraPos);
        const am = renderer.drawingManager.attributeManager;
        const a = { pos: gl.getAttribLocation(this.program, 'aVertexPosition'), off: gl.getAttribLocation(this.program, 'aInstanceOffset'), norm: gl.getAttribLocation(this.program, 'aInstanceNormal'), rand: gl.getAttribLocation(this.program, 'aInstanceRandom') };
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position); gl.enableVertexAttribArray(a.pos); gl.vertexAttribPointer(a.pos, 3, gl.FLOAT, false, 0, 0);
        const bindInst = (loc, buf, sz) => { if (loc !== -1 && buf) { gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, sz, gl.FLOAT, false, 0, 0); ext.vertexAttribDivisorANGLE(loc, 1); } };
        bindInst(a.off, obj.buffers.instanceOffset, 3); bindInst(a.norm, obj.buffers.instanceNormal, 3); bindInst(a.rand, obj.buffers.instanceRandom, 1);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices); ext.drawElementsInstancedANGLE(gl.TRIANGLES, obj.indicesCount, obj.buffers.indexType, 0, obj.buffers.instanceCount);
        if (a.off !== -1) ext.vertexAttribDivisorANGLE(a.off, 0); if (a.norm !== -1) ext.vertexAttribDivisorANGLE(a.norm, 0); if (a.rand !== -1) ext.vertexAttribDivisorANGLE(a.rand, 0);
    }
}
