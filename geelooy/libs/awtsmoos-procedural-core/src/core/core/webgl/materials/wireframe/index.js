
// B"H
/**
 * @file index.js (Wireframe Material)
 * @brief Renders lines with a solid configurable color.
 */
export { VS_SOURCE_WIREFRAME } from './vertex.js';
export { FS_SOURCE_WIREFRAME } from './fragment.js';

import { mat4_core } from '../../../math/mat4/core.js';
import { AttributeManager } from '../../renderer/managers/attributeManager.js';

export class WireframeMaterial {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.programInfo = null;
        this.attributeManager = new AttributeManager(gl);
    }

    setProgram(programInfo) {
        this.program = programInfo.program;
        this.programInfo = programInfo;
    }

    /**
     * B"H - Draws the wireframe "Skeletons" of objects.
     */
    draw(obj, context, color = [0.0, 0.0, 0.0, 1.0]) {
        const gl = this.gl;
        if (!obj.buffers.wireframeIndices) return;

        gl.useProgram(this.program);

        const modelViewMatrix = mat4_core.identity();
        mat4_core.multiply(modelViewMatrix, context.viewMatrix, context.worldModelMatrix);

        const u = this.programInfo.uniformLocations;
        gl.uniformMatrix4fv(u.projectionMatrix, false, context.projectionMatrix);
        gl.uniformMatrix4fv(u.modelViewMatrix, false, modelViewMatrix);
        gl.uniform4fv(gl.getUniformLocation(this.program, 'uColor'), color);

        const a = this.programInfo.attribLocations;
        this.attributeManager.bindAttribute(a.vertexPosition, obj.buffers.position, 3);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.wireframeIndices);
        const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
        
        gl.drawElements(gl.LINES, obj.buffers.wireframeIndicesCount, indexType, 0);
    }
}
