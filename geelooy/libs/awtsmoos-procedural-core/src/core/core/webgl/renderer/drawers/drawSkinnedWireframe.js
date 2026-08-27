
// B"H
import { mat4_core } from '../../../math/mat4/core.js';

export function drawSkinnedWireframe(context, obj) {
    const { renderer, projectionMatrix, viewMatrix, worldModelMatrix } = context;
    const { gl, skinnedProgramInfo: p, animationManager } = renderer;

    if (!p || !p.program || !obj.skeletonInstance) return;

    gl.useProgram(p.program);

    // Announce Wireframe Mode
    gl.uniform1f(gl.getUniformLocation(p.program, 'uIsWireframe'), 1.0);
    
    // Update bones in local space
    animationManager.updateSkeleton(obj.skeletonInstance, obj.id, context.currentTime);
    obj.skeletonInstance.updateWorldMatrices(mat4_core.identity());
    
    const finalBoneMatrices = obj.skeletonInstance.getFinalBoneMatrices();
    gl.uniformMatrix4fv(gl.getUniformLocation(p.program, 'uBoneMatrices'), false, finalBoneMatrices);

    gl.uniformMatrix4fv(p.uniformLocations.projectionMatrix, false, projectionMatrix);
    
    // B"H - RECTIFIED: Use the full ModelView matrix.
    let modelViewMatrix = mat4_core.identity();
    mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);
    gl.uniformMatrix4fv(p.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    
    const uModelMatrixLoc = gl.getUniformLocation(p.program, 'uModelMatrix');
    if (uModelMatrixLoc) gl.uniformMatrix4fv(uModelMatrixLoc, false, worldModelMatrix);

    const a = p.attribLocations;
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
    gl.vertexAttribPointer(a.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a.vertexPosition);

    if (obj.buffers.boneIndices && obj.buffers.boneWeights) {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.boneIndices);
        gl.vertexAttribPointer(a.boneIndices, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a.boneIndices);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.boneWeights);
        gl.vertexAttribPointer(a.boneWeights, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a.boneWeights);
    }

    const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.wireframeIndices);
    gl.drawElements(gl.LINES, obj.buffers.wireframeIndicesCount, indexType, 0);

    // Reset state for next draw call
    gl.uniform1f(gl.getUniformLocation(p.program, 'uIsWireframe'), 0.0);
}
