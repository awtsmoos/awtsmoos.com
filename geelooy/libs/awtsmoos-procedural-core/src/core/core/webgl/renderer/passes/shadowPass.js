
// B"H
/** @file shadowPass.js */
import { mat4_core } from '../../../math/mat4/core.js';

export function drawShadowPass(renderer, lightDir) {
    const gl = renderer.gl;
    const sp = renderer.shadowProgramInfo;
    const shadowSys = renderer.shadowSystem;
    const currentTime = (performance.now() - renderer.startTime) / 1000;

    if (!sp || !sp.program || !shadowSys) return;

    shadowSys.bindForWriting();
    shadowSys.updateLightMatrix(lightDir);
    gl.useProgram(sp.program);

    const uLightSpaceMatrixLoc = gl.getUniformLocation(sp.program, 'uLightSpaceMatrix');
    const uModelMatrixLoc = gl.getUniformLocation(sp.program, 'uModelMatrix');
    const uUseSkinningLoc = gl.getUniformLocation(sp.program, 'uUseSkinning');
    const uBoneMatricesLoc = gl.getUniformLocation(sp.program, 'uBoneMatrices');

    gl.uniformMatrix4fv(uLightSpaceMatrixLoc, false, shadowSys.lightSpaceMatrix);

    const drawShadowRecursive = (obj, parentWorldMatrix) => {
        if (!obj || !obj.buffers || obj.visible === false) return;
        const localModelMatrix = renderer.animationManager.getInterpolatedTransform(obj.id, currentTime);
        let worldModelMatrix = mat4_core.identity(); 
        if (parentWorldMatrix) mat4_core.multiply(worldModelMatrix, parentWorldMatrix, localModelMatrix); 
        else worldModelMatrix = localModelMatrix;

        gl.uniformMatrix4fv(uModelMatrixLoc, false, worldModelMatrix);

        // Handle Skinning
        const isSkinned = !!obj.skeletonInstance;
        gl.uniform1f(uUseSkinningLoc, isSkinned ? 1.0 : 0.0);
        if (isSkinned) {
            gl.uniformMatrix4fv(uBoneMatricesLoc, false, obj.skeletonInstance.getFinalBoneMatrices());
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
        gl.vertexAttribPointer(sp.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(sp.attribLocations.vertexPosition);

        if (isSkinned) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.boneIndices);
            gl.vertexAttribPointer(sp.attribLocations.boneIndices, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(sp.attribLocations.boneIndices);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.boneWeights);
            gl.vertexAttribPointer(sp.attribLocations.boneWeights, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(sp.attribLocations.boneWeights);
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, obj.indicesCount, indexType, 0);

        if (obj.children) obj.children.forEach(child => drawShadowRecursive(child, worldModelMatrix));
    };

    renderer.rootAnimatedObjects.forEach(obj => drawShadowRecursive(obj, null));
    shadowSys.unbind();
}
