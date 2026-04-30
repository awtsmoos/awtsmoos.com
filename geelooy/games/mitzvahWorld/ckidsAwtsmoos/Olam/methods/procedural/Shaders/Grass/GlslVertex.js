
/**
 * B"H
 * @module GlslVertex
 * @description
 * Sets the stage. In the vertex shader, we capture the absolute world position 
 * of the ground, ensuring that as the soul walks, the grass beneath is perfectly aligned.
 */
export default class GlslVertex {
    static getHeader() {
        return "varying vec3 vAwtsmoosWorldPos;\n";
    }

    static getBody() {
        return `
            #include <worldpos_vertex>
            vAwtsmoosWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `;
    }
}
