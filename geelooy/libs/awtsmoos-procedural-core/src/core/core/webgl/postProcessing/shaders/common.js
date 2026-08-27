
// B"H
/**
 * @file common.js
 * @brief This scroll contains the common vertex shader, a simple servant
 *        that prepares the canvas for the fragment shader's divine work.
 */
export const VS_COMMON = `
    attribute vec2 aVertexPosition;
    varying vec2 vUv;
    void main() {
        vUv = aVertexPosition * 0.5 + 0.5;
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;
