
// B"H
/**
 * @file drawer.js
 * @brief The ritual executor of the WebGL draw command.
 */
import { AttributeManager } from '../managers/attributeManager.js';

export class Drawer {
    constructor(gl) {
        this.gl = gl;
        this.attributeManager = new AttributeManager(gl);
    }

    /**
     * B"H - Binds necessary attributes and invokes the draw elements command.
     */
    draw(obj, attributeLocations) {
        const gl = this.gl;
        const am = this.attributeManager;
        const a = attributeLocations;
        const b = obj.buffers;

        // Core flesh
        am.bindAttribute(a.vertexPosition, b.position, 3);
        am.bindAttribute(a.vertexNormal, b.normal, 3);
        am.bindAttribute(a.vertexColor, b.color, 4);

        // Rigging data
        am.bindAttribute(a.boneIndices, b.boneIndices, 4);
        am.bindAttribute(a.boneWeights, b.boneWeights, 4);

        // Substantial manifestation
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.indices);
        const indexType = b.indexType || gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, obj.indicesCount, indexType, 0);
    }
}
