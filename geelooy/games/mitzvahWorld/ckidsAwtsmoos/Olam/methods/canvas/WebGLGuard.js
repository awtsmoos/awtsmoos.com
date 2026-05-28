
/**
 * B"H
 * @module WebGLGuard
 * @description
 * 
 * THE GUARDIAN AT THE THRESHOLD
 * 
 * "He stood at the threshold and looked..."
 * Before the Tzimtzum can occur and a World (Olam) can be formed,
 * the space itself must be inspected. Is the GPU ready? Does the browser possess
 * the strength to draw down the light?
 */

export default class WebGLGuard {
    /**
     * @function verify
     * @description
     * Probes the fabric of the current dimension for WebGL support.
     * 
     * @param {HTMLCanvasElement|OffscreenCanvas} canvas - The material vessel.
     * @returns {Object} { success: boolean, reason?: string, type?: string }
     */
    static verify(canvas) {
        if (!canvas) {
            return { success: false, reason: "The vessel (canvas) is non-existent." };
        }

        if (typeof canvas.getContext !== "function") {
            return { success: false, reason: "The vessel cannot create a graphics context." };
        }

        return {
            success: true,
            type: "deferred-to-three",
            reason: "Three.js owns first contact with the canvas context."
        };
    }
}
