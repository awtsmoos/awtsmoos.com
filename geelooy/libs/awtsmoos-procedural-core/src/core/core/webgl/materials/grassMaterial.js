
// B"H
/**
 * @file grassMaterial.js
 * @brief Defines the shader and uniform logic for the interactive grass.
 */

import { mat4_core } from '../../math/mat4/core.js';

export const VS_SOURCE_GRASS = `
    attribute vec3 aVertexPosition; 
    attribute vec3 aInstanceOffset; 
    attribute float aInstanceScale; 
    attribute float aInstanceRotation; 

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix; 
    uniform highp float uTime; 
    
    uniform highp vec3 uWindVector; 

    uniform int uInteractorCount;
    uniform vec3 uInteractors[5]; 
    uniform float uInteractorRadius[5];

    varying mediump vec3 vColor;
    varying highp vec3 vNormal;
    varying mediump float vHeight;

    mat4 rotateY(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat4(c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1);
    }

    void main(void) {
        vec3 pos = aVertexPosition;
        pos.y *= aInstanceScale; 
        vec3 worldPosBase = aInstanceOffset;

        float bendFactor = 0.0;
        vec3 pushDir = vec3(0.0);

        for (int i = 0; i < 5; i++) {
            if (i >= uInteractorCount) break;
            
            vec3 interactorPos = uInteractors[i];
            float radius = uInteractorRadius[i];
            
            float dist = distance(worldPosBase.xz, interactorPos.xz);
            
            if (dist < radius) {
                float power = smoothstep(radius, 0.0, dist); 
                if (power > bendFactor) {
                    bendFactor = power;
                    vec2 diff = worldPosBase.xz - interactorPos.xz;
                    vec2 dir2D = vec2(1.0, 0.0);
                    if (length(diff) > 0.001) dir2D = normalize(diff);
                    pushDir = vec3(dir2D.x, 0.0, dir2D.y); 
                }
            }
        }
        
        if (bendFactor > 0.001) {
            pos.y *= (1.0 - bendFactor * 0.9); 
            float pushAmount = pos.y * bendFactor * 2.0; 
            pos.xyz += pushDir * pushAmount;
        }

        if (bendFactor < 0.8) {
            float t = uTime * 1.5;
            vec2 windDir2D = vec2(1.0, 0.0);
            if (length(uWindVector.xz) > 0.001) windDir2D = normalize(uWindVector.xz);
            float phase = dot(worldPosBase.xz, windDir2D);
            float wave = sin(t + phase * 0.5) + sin(t * 2.0 + phase * 1.5) * 0.3;
            float heightFactor = pos.y * pos.y;
            pos.x += uWindVector.x * wave * 0.1 * heightFactor * (1.0 - bendFactor);
            pos.z += uWindVector.z * wave * 0.1 * heightFactor * (1.0 - bendFactor);
        }

        mat4 rotMat = rotateY(aInstanceRotation);
        vec4 rotatedPos = rotMat * vec4(pos, 1.0);
        vec3 finalWorldPos = rotatedPos.xyz + aInstanceOffset;
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(finalWorldPos, 1.0);

        float heightPct = clamp(aVertexPosition.y / 1.5, 0.0, 1.0);
        vHeight = heightPct;
        vec3 colBottom = vec3(0.05, 0.2, 0.05);
        vec3 colTop = vec3(0.4, 0.75, 0.1);
        float var = sin(aInstanceOffset.x * 0.3 + aInstanceOffset.z * 0.2) * 0.1;
        vColor = mix(colBottom, colTop, heightPct) + vec3(var);
        
        vec3 localNormal = vec3(0.0, 0.1, 1.0);
        if (aVertexPosition.x < -0.01) localNormal.x = -0.6;
        if (aVertexPosition.x > 0.01) localNormal.x = 0.6;
        
        localNormal = mix(normalize(localNormal), vec3(0,1,0), bendFactor);
        vNormal = (rotMat * vec4(localNormal, 0.0)).xyz;
    }
`;

export const FS_SOURCE_GRASS = `
    precision mediump float;
    #include <toneMapping>

    varying mediump vec3 vColor;
    varying highp vec3 vNormal;
    varying mediump float vHeight;
    
    uniform highp vec3 uAmbientLightColor; 
    uniform highp vec3 uDirectionalLightColor; 
    uniform highp vec3 uLightDirection; 

    void main(void) {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightDirection);
        float diff = max(dot(normal, lightDir), 0.0);
        float back = max(dot(normal, -lightDir), 0.0);
        float translucency = back * vHeight * 0.5; 
        
        vec3 rawLighting = uAmbientLightColor + (uDirectionalLightColor * (diff + translucency));
        vec3 finalColor = vColor * rawLighting;
        float exposure = 0.9;
        vec3 tm = aces(finalColor * exposure);
        gl_FragColor = vec4(pow(tm, vec3(0.4545)), 1.0);
    }
`;

export class GrassMaterial {
    constructor(gl) { this.gl = gl; }
    setProgram(programInfo) { this.program = programInfo.program; }

    draw(obj, context) {
        const { renderer, projectionMatrix, viewMatrix, worldModelMatrix, globalShaderVars } = context;
        const gl = this.gl;
        const ext = gl.extInstanced;

        if (!this.program || !ext || !obj.buffers || obj.buffers.instanceCount <= 0) return;

        gl.useProgram(this.program);
        
        let modelViewMatrix = mat4_core.identity();
        mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);

        // Uniforms
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelViewMatrix'), false, modelViewMatrix);
        const lightDir = globalShaderVars.uLightDirection ||[0,1,0];
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), globalShaderVars.uAmbientLightColor || [0.2,0.2,0.2]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), globalShaderVars.uDirectionalLightColor || [1,1,1]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), lightDir);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uWindVector'), globalShaderVars.uWindVector ||[1, 0, 0]);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), performance.now() / 1000);

        // Physics Interactors (extract from scene)
        const player = renderer.objectMap.get('golem_manifest');
        if (player && player.keyframes && player.keyframes[0]) {
            gl.uniform1i(gl.getUniformLocation(this.program, 'uInteractorCount'), 1);
            gl.uniform3fv(gl.getUniformLocation(this.program, 'uInteractors'), new Float32Array(player.keyframes[0].position));
            gl.uniform1fv(gl.getUniformLocation(this.program, 'uInteractorRadius'), new Float32Array([2.0]));
        } else {
            gl.uniform1i(gl.getUniformLocation(this.program, 'uInteractorCount'), 0);
        }

        // Attributes
        const posLoc = gl.getAttribLocation(this.program, 'aVertexPosition');
        const offsetLoc = gl.getAttribLocation(this.program, 'aInstanceOffset');
        const scaleLoc = gl.getAttribLocation(this.program, 'aInstanceScale');
        const rotLoc = gl.getAttribLocation(this.program, 'aInstanceRotation');

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);

        const bindInst = (loc, buf, size) => {
            if (loc !== -1 && buf) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
                ext.vertexAttribDivisorANGLE(loc, 1);
            }
        };

        bindInst(offsetLoc, obj.buffers.instanceOffset, 3);
        bindInst(scaleLoc, obj.buffers.instanceScale, 1);
        bindInst(rotLoc, obj.buffers.instanceRotation, 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
        ext.drawElementsInstancedANGLE(gl.TRIANGLES, obj.indicesCount, indexType, 0, obj.buffers.instanceCount);
        
        // Reset divisors
        if (posLoc !== -1) ext.vertexAttribDivisorANGLE(posLoc, 0);
        if (offsetLoc !== -1) ext.vertexAttribDivisorANGLE(offsetLoc, 0);
        if (scaleLoc !== -1) ext.vertexAttribDivisorANGLE(scaleLoc, 0);
        if (rotLoc !== -1) ext.vertexAttribDivisorANGLE(rotLoc, 0);
    }
}
