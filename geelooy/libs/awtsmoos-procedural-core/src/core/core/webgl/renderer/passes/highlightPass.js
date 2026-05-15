
// B"H
/**
 * @file highlightPass.js
 * @brief Draws the glowing wireframe outline of the currently selected object.
 */
import { mat4_core } from '../../../math/mat4/core.js';
import { mat4_transformations } from '../../../math/mat4/transformations.js';

export function drawHighlightPass(renderer, selectedObject, projectionMatrix, viewMatrix) {
    if (!selectedObject || !selectedObject.buffers || !selectedObject.buffers.wireframeIndices) return;

    const gl = renderer.gl;
    const progInfo = renderer.programManager.wireframeProgramInfo;
    if (!progInfo) return;

    gl.useProgram(progInfo.program);

    // Disable depth testing so the outline shows through walls
    gl.disable(gl.DEPTH_TEST);
    // Use additive blending for a glow effect
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Calculate matrix
    const pos = selectedObject.keyframes && selectedObject.keyframes[0] ? selectedObject.keyframes[0].position : [0,0,0];
    const worldModelMatrix = mat4_core.identity();
    mat4_transformations.translate(worldModelMatrix, pos);

    const modelViewMatrix = mat4_core.identity();
    mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);

    const u = progInfo.uniformLocations;
    gl.uniformMatrix4fv(u.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(u.modelViewMatrix, false, modelViewMatrix);
    
    // Golden Orange Highlight Color
    gl.uniform4fv(gl.getUniformLocation(progInfo.program, 'uColor'), [1.0, 0.6, 0.0, 1.0]);

    const aPos = gl.getAttribLocation(progInfo.program, 'aVertexPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, selectedObject.buffers.position);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, selectedObject.buffers.wireframeIndices);
    const indexType = selectedObject.buffers.indexType || gl.UNSIGNED_SHORT;
    
    // Make the line slightly thicker if possible (WebGL line width support varies)
    gl.lineWidth(2.0);
    gl.drawElements(gl.LINES, selectedObject.buffers.wireframeIndicesCount, indexType, 0);
    gl.lineWidth(1.0);

    // Restore state
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
}
