
/**
 * B"H
 * @module VertexLogic
 * @description
 * "And the spirit of G-d hovered over the face of the waters."
 * This module calculates the world-space position of every point on the plane, 
 * sending it as a "varying" messenger to the fragment shader. 
 * If the world is a stage, this logic sets the precise location of every prop.
 */

export default class VertexLogic {
    /**
     * @function getVertexShaderHeader
     * @description Declares the messenger variable in the vertex shader.
     */
    static getVertexShaderHeader() {
        return "varying vec3 vAwtsmoosWorldPos;\n";
    }

    /**
     * @function getVertexShaderBody
     * @description Calculates the absolute world position of the point.
     */
    static getVertexShaderBody() {
        return `
            #include <worldpos_vertex>
            vAwtsmoosWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `;
    }
}
