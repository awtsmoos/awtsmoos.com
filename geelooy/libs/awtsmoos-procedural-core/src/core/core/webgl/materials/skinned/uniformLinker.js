
// B"H
/**
 * @file uniformLinker.js
 * @brief Channelling the world-state into the skinned shader's uniforms.
 */
import { mat4_core } from '../../../math/mat4/core.js';
import { WebGLVessels as GLV } from '../../renderer/utils/webglVessels.js';

export class UniformLinker {
    static link(gl, programInfo, context, bonePalette) {
        const { projectionMatrix, viewMatrix, worldModelMatrix, cameraPos, globalShaderVars } = context;
        const p = programInfo;
        const prog = p.program;

        // 1. Bones
        const uBonePalette = gl.getUniformLocation(prog, 'uBoneMatrices');
        if (uBonePalette) gl.uniformMatrix4fv(uBonePalette, false, bonePalette);

        // 2. Matrices
        GLV.setMatrix4(gl, p.uniformLocations.projectionMatrix, projectionMatrix);
        
        const mv = mat4_core.identity();
        mat4_core.multiply(mv, viewMatrix, worldModelMatrix);
        GLV.setMatrix4(gl, p.uniformLocations.modelViewMatrix, mv);
        GLV.setMatrix4(gl, gl.getUniformLocation(prog, 'uModelMatrix'), worldModelMatrix);

        // 3. Normals
        let nm = mat4_core.identity(), invM = mat4_core.identity();
        if (mat4_core.inverse(invM, worldModelMatrix)) mat4_core.transpose(nm, invM);
        GLV.setMatrix4(gl, p.uniformLocations.normalMatrix, nm);

        // 4. Lights
        const v = { ...globalShaderVars };
        GLV.setVec3(gl, gl.getUniformLocation(prog, 'uAmbientLightColor'), v.uAmbientLightColor || [0.3, 0.3, 0.3]);
        GLV.setVec3(gl, gl.getUniformLocation(prog, 'uDirectionalLightColor'), v.uDirectionalLightColor || [1, 1, 1]);
        GLV.setVec3(gl, gl.getUniformLocation(prog, 'uLightDirection'), v.uLightDirection || [0.5, 1, 0.5]);
        GLV.setVec3(gl, gl.getUniformLocation(prog, 'uViewPos'), cameraPos || [0, 0, 0]);
    }
}
